import { SettingsFormField } from '@devvit/public-api';

export const appSettings: SettingsFormField[] = [
  {
    type: 'group',
    label: '1. General Setup & Exceptions',
    fields: [
      {
        name: 'language',
        type: 'select',
        label: 'App Language',
        helpText: 'Select the default language for automated notifications and subjects. You can still write custom texts below to override the defaults.',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Deutsch (German)', value: 'de' },
          { label: 'Español (Spanish)', value: 'es' },
          { label: 'Français (French)', value: 'fr' },
          { label: 'Português (Portuguese)', value: 'pt' },
          { label: 'Italiano (Italian)', value: 'it' },
          { label: 'Nederlands (Dutch)', value: 'nl' }
        ],
        multiSelect: false,
        defaultValue: ['en']
      },
      {
        name: 'ignored_flairs',
        type: 'string',
        label: 'Ignored Post Flairs (Comma separated)',
        helpText: 'Posts with these exact flairs will be ignored. Case-insensitive.'
      },
      {
        name: 'ignore_moderators',
        type: 'boolean',
        label: 'Ignore Moderators',
        defaultValue: true
      },
      {
        name: 'ignore_approved_users',
        type: 'boolean',
        label: 'Ignore Approved Users',
        defaultValue: true
      },
      {
        name: 'ignore_verified_email',
        type: 'boolean',
        label: 'Ignore users with verified email',
        defaultValue: false
      },
      {
        name: 'ignore_total_karma',
        type: 'number',
        label: 'Ignore by total account karma (Set to 0 to disable)',
        defaultValue: 0
      },
      {
        name: 'ignore_community_karma',
        type: 'number',
        label: 'Ignore by community karma (Set to 0 to disable)',
        defaultValue: 0
      }
    ]
  },
  {
    type: 'group',
    label: '2. Scenario A: Empty Post',
    fields: [
      {
        name: 'enable_timer_1',
        type: 'boolean',
        label: 'Enable Timer 1 (Empty Post Watchdog)',
        defaultValue: true
      },
      {
        name: 'empty_wait_time_minutes',
        type: 'number',
        label: 'Wait time for initial community response (in minutes)',
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
        label: 'Notification Type',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Leave a stickied comment', value: 'comment' },
          { label: 'Send a Modmail', value: 'modmail' }
        ],
        multiSelect: false,
        defaultValue: ['none']
      },
      {
        name: 'empty_subject',
        type: 'string',
        label: 'Custom Modmail Subject (Empty Post)',
        helpText: 'LEAVE EMPTY to use the translated default subject.',
        defaultValue: ''
      },
      {
        name: 'empty_notification_text',
        type: 'paragraph',
        label: 'Custom Notification Text (Empty Post)',
        helpText: 'LEAVE EMPTY to use the default language. Placeholders: {{author}}, {{action}}, {{x}}.',
        defaultValue: ''
      }
    ]
  },
  {
    type: 'group',
    label: '3. Scenario B: OP Does Not Reply',
    fields: [
      {
        name: 'enable_timer_2',
        type: 'boolean',
        label: 'Enable Timer 2 (OP Reply Watchdog)',
        defaultValue: true
      },
      {
        name: 'reply_wait_time_minutes',
        type: 'number',
        label: 'Final wait time for OP reply (in minutes)',
        defaultValue: 60
      },
      {
        name: 'min_op_comment_length',
        type: 'number',
        label: 'Minimum OP Reply Length (Characters)',
        helpText: 'Replies from OP with fewer characters than this will be ignored (e.g. simple "Thanks"). Set to 0 to disable.',
        defaultValue: 0
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
        label: 'Notification Type (Final Action)',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Leave a stickied comment', value: 'comment' },
          { label: 'Send a Modmail', value: 'modmail' }
        ],
        multiSelect: false,
        defaultValue: ['none']
      },
      {
        name: 'reply_subject',
        type: 'string',
        label: 'Custom Modmail Subject (Final Action)',
        defaultValue: ''
      },
      {
        name: 'reply_notification_text',
        type: 'paragraph',
        label: 'Custom Notification Text (Final Action)',
        defaultValue: ''
      },
      {
        name: 'enable_warning_timer',
        type: 'boolean',
        label: 'Enable Warning Timer',
        helpText: 'If enabled, sends a warning message before the final timer expires.',
        defaultValue: false
      },
      {
        name: 'warning_wait_time_minutes',
        type: 'number',
        label: 'Wait time until WARNING is sent (in minutes)',
        helpText: 'Must be lower than the Final OP Reply wait time.',
        defaultValue: 45
      },
      {
        name: 'warning_notification_type',
        type: 'select',
        label: 'Notification Type (Warning)',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Leave a stickied comment', value: 'comment' },
          { label: 'Send a Modmail', value: 'modmail' }
        ],
        multiSelect: false,
        defaultValue: ['none']
      },
      {
        name: 'warning_subject',
        type: 'string',
        label: 'Custom Modmail Subject (Warning)',
        defaultValue: ''
      },
      {
        name: 'warning_notification_text',
        type: 'paragraph',
        label: 'Custom Notification Text (Warning)',
        helpText: 'Placeholders: {{author}}, {{action}}, {{xy}} (Remaining minutes).',
        defaultValue: ''
      }
    ]
  },
  {
    type: 'group',
    label: '4. Manual Comment Watchdog',
    fields: [
      {
        name: 'manual_watch_default_text',
        type: 'paragraph',
        label: 'Subreddit Default Comment Text (OP Ping)',
        helpText: 'LEAVE EMPTY to use the built-in translated text (App Language). Entering text here sets a subreddit-wide default, which can still be individually overridden in the pop-up form when triggering the watchdog. Placeholders: {{op}}, {{minutes}}, {{commenter}}.',
        defaultValue: ''
      }
    ]
  }
];