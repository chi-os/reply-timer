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
        helpText: 'Select the default language for automated notifications and mod notes. You can still write custom notification texts below to override the defaults.',
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
    label: '2. Timer 1: Post Creation (Empty Post)',
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
        label: 'Custom Notification Text (Empty Post)',
        helpText: 'LEAVE EMPTY to use the default text for your selected language. If you write here, it will override the default. Placeholders: {{author}}, {{action}}, {{x}}.',
        defaultValue: ''
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
        defaultValue: true
      },
      {
        name: 'reply_wait_time_minutes',
        type: 'number',
        label: 'Wait time for OP reply (in minutes)',
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
        label: 'Custom Notification Text (No Reply)',
        helpText: 'LEAVE EMPTY to use the default text for your selected language. If you write here, it will override the default. Placeholders: {{author}}, {{action}}, {{x}}.',
        defaultValue: ''
      }
    ]
  }
];