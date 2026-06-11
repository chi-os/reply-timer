import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import type { OnPostSubmitRequest, TriggerResponse } from '@devvit/web/shared';
import type { TaskRequest, TaskResponse } from '@devvit/web/server';

// Die neuen Reddit-Werkzeuge importieren
import { reddit } from '@devvit/reddit';
import { scheduler } from '@devvit/web/server';

const app = new Hono();

// ==========================================
// ROUTE 1: Trigger (Neuer Beitrag kommt rein)
// ==========================================
app.post('/internal/triggers/on-post-submit', async (c) => {
  const input = await c.req.json<OnPostSubmitRequest>();
  const post = input.post;

  if (!post || !post.id) {
    return c.json<TriggerResponse>({ status: 'ok' });
  }

  // Hier stellst du die Wartezeit in Minuten ein (Aktuell: 1 Minute zum Testen)
  const delayMinutes = 1;
  const runAt = new Date(Date.now() + delayMinutes * 60 * 1000);

  console.log(`⏱️ Beitrag ${post.id} erkannt. Stelle Wecker auf ${runAt.toLocaleTimeString()}`);

  try {
    // Den Scheduler-Job (Wecker) bei Reddit registrieren
    await scheduler.runJob({
      id: `job-delete-${post.id}`, // Eine eindeutige ID für diesen spezifischen Timer
      name: 'delayed-delete',      // Muss exakt dem Namen im scheduler-Block der devvit.json entsprechen
      data: { postId: post.id },   // Wir geben die Post-ID als Gepäck an den Wecker mit
      runAt: runAt,
    });
  } catch (error) {
    console.error(`[ERROR] Fehler beim Stellen des Weckers:`, error);
  }

  return c.json<TriggerResponse>({ status: 'ok' });
});


// ==========================================
// ROUTE 2: Scheduler (Der Wecker klingelt)
// ==========================================
app.post('/internal/scheduler/delayed-delete', async (c) => {
  // Das Gepäck (Post-ID) aus dem Wecker auslesen
  const request = await c.req.json<TaskRequest<{ postId: string }>>();
  const postId = request.data?.postId;

  if (!postId) {
    return c.json<TaskResponse>({ status: 'ok' });
  }

  console.log(`⏰ Wecker klingelt! Lösche jetzt Beitrag: ${postId}...`);

  try {
    const redditPost = await reddit.getPostById(postId);
    await redditPost.remove(false);
    
    await redditPost.addRemovalNote({ 
      reasonId: '', 
      modNote: "Automatisch gelöscht: Die Wartefrist ist abgelaufen." 
    });
    
    console.log(`🗑️ Beitrag ${postId} erfolgreich gelöscht!`);
  } catch (error) {
    console.error(`[ERROR] Fehler beim zeitgesteuerten Löschen:`, error);
  }

  return c.json<TaskResponse>({ status: 'ok' });
});


// ==========================================
// SERVER START
// ==========================================
serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});