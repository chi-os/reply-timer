export interface TranslationStrings {
  // Actions
  action_removed: string;
  action_filtered: string;
  action_flagged: string;

  // Scenario A: Empty Post
  empty_post: string;
  subject_empty: string;
  mod_note_empty: string;

  // Scenario B: OP Warning
  warning_post: string;
  subject_warning: string;

  // Scenario B: Final Action
  reply_post: string;
  subject_reply: string;
  mod_note_reply: string;

  // Scenario C: Manual Comment Watchdog
  manual_watch_comment: string;
  manual_watch_note: string;
}

export const translations: Record<string, TranslationStrings> = {
  en: {
    action_removed: 'removed',
    action_filtered: 'filtered to the modqueue for review',
    action_flagged: 'flagged',
    empty_post: 'Hello {{author}},\n\nYour post has received no comments from the community within {{x}} minutes. As a result, it has been {{action}}.\n\nIf you have questions, please contact Modmail.',
    subject_empty: 'Notification regarding your post on r/{{subreddit}}',
    mod_note_empty: 'OP Reply Enforcer: Post received no traction within timeframe.',
    warning_post: 'Hello {{author}},\n\nA community member replied to your post! Please participate in the discussion. You have {{xy}} minutes remaining before your post is {{action}}.',
    subject_warning: 'Reminder: Community members replied to your post',
    reply_post: 'Hello {{author}},\n\nYour post was {{action}} because you did not reply to comments within {{x}} minutes.\n\nIf you have questions, please contact Modmail.',
    subject_reply: 'Post Actioned: No OP participation',
    mod_note_reply: 'OP Reply Enforcer: OP failed to reply to comments within timeframe.',
    manual_watch_comment: 'Hello {{op}},\n\nYou have been requested by the moderators to reply to this comment within {{minutes}} minutes.',
    manual_watch_note: 'OP failed to reply to comment within {{minutes}} minutes.'
  },
  de: {
    action_removed: 'entfernt',
    action_filtered: 'zur Überprüfung in die Modqueue verschoben',
    action_flagged: 'markiert',
    empty_post: 'Hallo {{author}},\n\ndein Beitrag hat innerhalb von {{x}} Minuten keine Kommentare aus der Community erhalten. Daher wurde er {{action}}.\n\nBei Fragen wende dich bitte an die Modmail.',
    subject_empty: 'Hinweis zu deinem Beitrag auf r/{{subreddit}}',
    mod_note_empty: 'OP Reply Enforcer: Beitrag erhielt innerhalb der Frist keine Interaktion.',
    warning_post: 'Hallo {{author}},\n\nein Mitglied der Community hat auf deinen Beitrag geantwortet! Bitte beteilige dich an der Diskussion. Du hast noch {{xy}} Minuten Zeit, bevor dein Beitrag {{action}} wird.',
    subject_warning: 'Erinnerung: Es gibt neue Antworten auf deinen Beitrag',
    reply_post: 'Hallo {{author}},\n\ndein Beitrag wurde {{action}}, da du nicht innerhalb von {{x}} Minuten auf Kommentare geantwortet hast.\n\nBei Fragen wende dich bitte an die Modmail.',
    subject_reply: 'Beitrag moderiert: Keine Rückmeldung des Erstellers',
    mod_note_reply: 'OP Reply Enforcer: OP hat nicht innerhalb der Frist auf Kommentare geantwortet.',
    manual_watch_comment: 'Hallo {{op}},\n\ndu wurdest von den Moderatoren gebeten, innerhalb von {{minutes}} Minuten auf diesen Kommentar zu antworten.',
    manual_watch_note: 'OP hat nicht innerhalb von {{minutes}} Minuten auf den Kommentar geantwortet.'
  },
  es: {
    action_removed: 'eliminada',
    action_filtered: 'enviada a la cola de moderación para revisión',
    action_flagged: 'marcada',
    empty_post: 'Hola {{author}},\n\ntu publicación no ha recibido comentarios de la comunidad en {{x}} minutos. Por lo tanto, ha sido {{action}}.\n\nSi tienes dudas, contacta al Modmail.',
    subject_empty: 'Aviso sobre tu publicación en r/{{subreddit}}',
    mod_note_empty: 'OP Reply Enforcer: Sin comentarios dentro del plazo.',
    warning_post: 'Hola {{author}},\n\n¡Un miembro de la comunidad respondió a tu publicación! Por favor participa en la conversación. Te quedan {{xy}} minutos antes de que tu publicación sea {{action}}.',
    subject_warning: 'Recordatorio: Han respondido a tu publicación',
    reply_post: 'Hola {{author}},\n\ntu publicación fue {{action}} porque no respondiste a los comentarios en un plazo de {{x}} minutos.\n\nSi tienes dudas, contacta al Modmail.',
    subject_reply: 'Publicación moderada: Sin respuesta del OP',
    mod_note_reply: 'OP Reply Enforcer: El OP no respondió a tiempo.',
    manual_watch_comment: 'Hola {{op}},\n\nlos moderadores te han solicitado responder a este comentario en un plazo de {{minutes}} minutos.',
    manual_watch_note: 'El OP no respondió al comentario en el plazo de {{minutes}} minutos.'
  },
  fr: {
    action_removed: 'supprimée',
    action_filtered: 'placée en file de modération pour examen',
    action_flagged: 'signalée',
    empty_post: 'Bonjour {{author}},\n\nvotre publication n\'a reçu aucun commentaire dans un délai de {{x}} minutes. Par conséquent, elle a été {{action}}.\n\nPour toute question, contactez le Modmail.',
    subject_empty: 'Notification concernant votre publication sur r/{{subreddit}}',
    mod_note_empty: 'OP Reply Enforcer: Aucun commentaire dans le délai imparti.',
    warning_post: 'Bonjour {{author}},\n\nun membre de la communauté a répondu à votre publication ! Merci de participer à la discussion. Il vous reste {{xy}} minutes avant que votre publication ne soit {{action}}.',
    subject_warning: 'Rappel : Nouveau commentaire sur votre publication',
    reply_post: 'Bonjour {{author}},\n\nvotre publication a été {{action}} car vous n\'avez pas répondu aux commentaires dans un délai de {{x}} minutes.\n\nPour toute question, contactez le Modmail.',
    subject_reply: 'Action de modération : Pas de réponse de l\'OP',
    mod_note_reply: 'OP Reply Enforcer: L\'OP n\'a pas répondu dans le délai imparti.',
    manual_watch_comment: 'Bonjour {{op}},\n\nles modérateurs vous demandent de répondre à ce commentaire dans un délai de {{minutes}} minutes.',
    manual_watch_note: 'L\'OP n\'a pas répondu au commentaire dans le délai de {{minutes}} minutes.'
  },
  pt: {
    action_removed: 'removida',
    action_filtered: 'enviada para a fila de moderação para análise',
    action_flagged: 'sinalizada',
    empty_post: 'Olá {{author}},\n\nsua postagem não recebeu comentários da comunidade em {{x}} minutos. Como resultado, ela foi {{action}}.\n\nSe tiver dúvidas, entre em contato via Modmail.',
    subject_empty: 'Notificação sobre sua postagem no r/{{subreddit}}',
    mod_note_empty: 'OP Reply Enforcer: Sem comentários dentro do prazo.',
    warning_post: 'Olá {{author}},\n\num membro da comunidade respondeu à sua postagem! Por favor, participe da discussão. Você tem {{xy}} minutos restantes antes que ela seja {{action}}.',
    subject_warning: 'Lembrete: Responderam à sua postagem',
    reply_post: 'Olá {{author}},\n\nsua postagem foi {{action}} porque você não respondeu aos comentários em até {{x}} minutos.\n\nSe tiver dúvidas, entre em contato via Modmail.',
    subject_reply: 'Postagem moderada: Sem resposta do OP',
    mod_note_reply: 'OP Reply Enforcer: O OP não respondeu dentro do prazo.',
    manual_watch_comment: 'Olá {{op}},\n\nos moderadores solicitaram que você responda a este comentário em até {{minutes}} minutos.',
    manual_watch_note: 'O OP não respondeu ao comentário no prazo de {{minutes}} minutos.'
  },
  it: {
    action_removed: 'rimosso',
    action_filtered: 'inviato alla coda di moderazione per la revisione',
    action_flagged: 'segnalato',
    empty_post: 'Ciao {{author}},\n\nil tuo post non ha ricevuto commenti entro {{x}} minuti. Di conseguenza, è stato {{action}}.\n\nIn caso di domande, contatta Modmail.',
    subject_empty: 'Notifica relativa al tuo post su r/{{subreddit}}',
    mod_note_empty: 'OP Reply Enforcer: Nessuna interazione entro il limite di tempo.',
    warning_post: 'Ciao {{author}},\n\nun membro della community ha risposto al tuo post! Partecipa alla discussione. Ti rimangono {{xy}} minuti prima che il post venga {{action}}.',
    subject_warning: 'Promemoria: Hanno risposto al tuo post',
    reply_post: 'Ciao {{author}},\n\nil tuo post è stato {{action}} perché non hai risposto ai commenti entro {{x}} minuti.\n\nIn caso di domande, contatta Modmail.',
    subject_reply: 'Post moderato: Nessuna risposta dall\'OP',
    mod_note_reply: 'OP Reply Enforcer: L\'OP non ha risposto entro il tempo limite.',
    manual_watch_comment: 'Ciao {{op}},\n\ni moderatori ti hanno richiesto di rispondere a questo commento entro {{minutes}} minuti.',
    manual_watch_note: 'L\'OP non ha risposto al commento entro il termine di {{minutes}} minuti.'
  },
  nl: {
    action_removed: 'verwijderd',
    action_filtered: 'naar de modqueue gestuurd ter beoordeling',
    action_flagged: 'gemarkeerd',
    empty_post: 'Hallo {{author}},\n\nje bericht heeft binnen {{x}} minuten geen reacties ontvangen. Daarom is het {{action}}.\n\nNeem bij vragen contact op via Modmail.',
    subject_empty: 'Melding over je bericht op r/{{subreddit}}',
    mod_note_empty: 'OP Reply Enforcer: Geen interactie binnen het tijdsbestek.',
    warning_post: 'Hallo {{author}},\n\neen lid van de community heeft gereageerd op je bericht! Neem deel aan het gesprek. Je hebt nog {{xy}} minuten voordat je bericht wordt {{action}}.',
    subject_warning: 'Herinnering: Er is gereageerd op je bericht',
    reply_post: 'Hallo {{author}},\n\nje bericht is {{action}} omdat je niet binnen {{x}} minuten op reacties hebt gereageerd.\n\nNeem bij vragen contact op via Modmail.',
    subject_reply: 'Bericht gemodereerd: Geen reactie van OP',
    mod_note_reply: 'OP Reply Enforcer: OP heeft niet tijdig gereageerd.',
    manual_watch_comment: 'Hallo {{op}},\n\nje bent door de moderators verzocht om binnen {{minutes}} minuten op deze opmerking te reageren.',
    manual_watch_note: 'OP heeft niet binnen {{minutes}} minuten gereageerd op de opmerking.'
  }
};