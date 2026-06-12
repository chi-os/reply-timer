import { SettingsFormField } from '@devvit/public-api';

export const appSettings: SettingsFormField[] = [
  {
    type: 'group',
    label: '1. Exceptions & Rules',
    fields: [
      {
        name: 'ignored_flairs',
        type: 'string',
        label: 'Ignored Post Flairs (Comma separated)',
        helpText: 'Posts with these exact flairs will be ignored (e.g., "Announcement, Megathread"). Case-insensitive.'
      },
      {
        name: 'ignore_moderators',
        type: 'boolean',
        label: 'Ignore Moderators',
        helpText: 'If enabled, the timers will ignore posts made by moderators.',
        defaultValue: true
      },
      {
        name: 'ignore_approved_users',
        type: 'boolean',
        label: 'Ignore Approved Users',
        helpText: 'If enabled, the timers will ignore posts made by approved users.',
        defaultValue: true
      },
      {
        name: 'ignore_verified_email',
        type: 'boolean',
        label: 'Ignore users with verified email',
        helpText: 'If enabled, the timers will ignore posts made by users who have a verified email address.',
        defaultValue: false
      },
      {
        name: 'ignore_total_karma',
        type: 'number',
        label: 'Ignore by total account karma',
        helpText: 'Ignore users with a total karma equal to or higher than this value. Set to 0 to disable.',
        defaultValue: 0
      },
      {
        name: 'ignore_community_karma',
        type: 'number',
        label: 'Ignore by community karma',
        helpText: 'Ignore users with community karma equal to or higher than this value. Set to 0 to disable.',
        defaultValue: 0
      }
    ]
  },
  {
    type: 'group',
    label: '2. Timer 1: Post Creation (Empty Post)',
    fields: [
      {
        name: 'enable_timer_1',
        type: 'boolean',
        label: 'Enable Timer 1 (Empty Post Watchdog)',
        helpText: 'Turn this ON to take action if a post receives NO comments from the community at all.',
        defaultValue: true
      },
      {
        name: 'empty_wait_time_minutes',
        type: 'number',
        label: 'Wait time for initial community response (in minutes)',
        helpText: 'How long should the app wait for the FIRST community comment before considering the post "empty"?',
        defaultValue: 60
      },
      {
        name: 'empty_action',
        type: 'select',
        label: 'Action if post remains empty',
        options: [
          { label: 'Do nothing (Keep post)', value: 'none' },
          { label: 'Remove post', value: 'remove' },
          { label: 'Filter to modqueue', value: 'filter' }
        ],
        multiSelect: false,
        defaultValue: ['none']
      },
      {
        name: 'empty_notification_type',
        type: 'select',
        label: 'Notification Type (Empty Post)',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Leave a stickied comment', value: 'comment' },
          { label: 'Send a Modmail', value: 'modmail' }
        ],
        multiSelect: false,
        defaultValue: ['none']
      },
      {
        name: 'empty_notification_text',
        type: 'paragraph',
        label: 'Notification Text Template (Empty Post)',
        helpText: 'Customize the message sent to the author. You can use these dynamic placeholders:\n\n• {{author}} - Replaced with the username.\n• {{action}} - Becomes "removed", "filtered to the modqueue", or "flagged (but no action was taken)" if Action is "Do nothing".\n• {{x}} - Inserts the exact wait time.\n\n💡 Pro-Tip: The word "Modmail" will automatically be converted into a clickable markdown hyperlink.',
        defaultValue: 'Hello {{author}}.\n\nYour post has been {{action}} because it did not receive any responses from the community within the {{x}} minute timeframe.\n\nIf you have any questions, please reach out via Modmail.'
      }
    ]
  },
  {
    type: 'group',
    label: '3. Timer 2: First Comment (OP Reply)',
    fields: [
      {
        name: 'enable_timer_2',
        type: 'boolean',
        label: 'Enable Timer 2 (OP Reply Watchdog)',
        helpText: 'Turn this ON to take action if the community comments, but the OP fails to reply.',
        defaultValue: true
      },
      {
        name: 'reply_wait_time_minutes',
        type: 'number',
        label: 'Wait time for OP reply (in minutes)',
        helpText: 'After the first community comment is made, how long does the OP have to reply?',
        defaultValue: 60
      },
      {
        name: 'reply_action',
        type: 'select',
        label: 'Action if OP fails to reply',
        options: [
          { label: 'Do nothing', value: 'none' },
          { label: 'Remove post', value: 'remove' },
          { label: 'Filter to modqueue', value: 'filter' }
        ],
        multiSelect: false,
        defaultValue: ['remove']
      },
      {
        name: 'reply_notification_type',
        type: 'select',
        label: 'Notification Type (No Reply)',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Leave a stickied comment', value: 'comment' },
          { label: 'Send a Modmail', value: 'modmail' }
        ],
        multiSelect: false,
        defaultValue: ['none']
      },
      {
        name: 'reply_notification_text',
        type: 'paragraph',
        label: 'Notification Text Template (No Reply)',
        helpText: 'Customize the message sent to the author. You can use these dynamic placeholders:\n\n• {{author}} - Replaced with the username.\n• {{action}} - Becomes "removed", "filtered to the modqueue", or "flagged (but no action was taken)" if Action is "Do nothing".\n• {{x}} - Inserts the exact wait time.\n\n💡 Pro-Tip: The word "Modmail" will automatically be converted into a clickable markdown hyperlink.',
        defaultValue: 'Hello {{author}}.\n\nYour post has been {{action}} because you did not reply to any comments within the {{x}} minute timeframe required by this subreddit.\n\nIf you have any questions, please reach out via Modmail.'
      }
    ]
  }
];