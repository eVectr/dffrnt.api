
module.exports = {
    Global:     { // RESERVED ~ !!!
        config:     {
            name:        'global',
            title:       'API Remoter',
            description: 'Server API Access',
            accessor:     false,
            page:         null,
        }, 
        expose:     [
            'accessor',
            'rest',
        ],
    },
    Accessor:   { // RESERVED ~ !!!
        config:     {
            name:        'accessor',
            title:       'API Authoriser',
            description: 'Granting Access',
            accessor:     true,
            page:         null,
        },
    },
    REST:       { // RESERVED ~ !!!
        config:     {
            name:        'rest',
            title:       'API Explorer',
            description: 'Querying Data',
            accessor:     false,
            page:        {
                title:      () => 'API Explorer',
                CSS:        ['explorer'],
                styles:      true,
                main:       'explorer',
                type:       'cover',
            },
        },
    },
    Error:      {
        config:     {
            name:        'error',
            scheme:      '/404/',
            title:       'Error Page',
            description: 'Displaying Errors',
            accessor:     false,
            restrict:    { true: null, false: null },
            page:        {
                title:      (path) => '404 Error',
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'jumbo',
            },
        },
    },
    Main:       {
        config:     {
            name:        'main',
            scheme:      '/\\b(home|log(in|out))\\b/',
            title:       'Main Page',
            description: 'Default Functionality',
            accessor:     false,
            restrict:    { true: 'profile', false: null },
            page:        {
                title:      (path) => ('Powered by People.'),
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'jumbo',
            },
        },
    },
    Static:     {
        config:     {
            name:        'static',
            scheme:      '/\\b(about|help|safety|privacy|terms)\\b/',
            title:       'Static Page',
            description: 'Displaying Static Pages',
            accessor:     false,
            restrict:    { true: null, false: null },
            page:        {
                title:      (path) => ({
                      '/about': 'About Us',
			           '/help': 'Help / FAQ',
			         '/safety': 'Safety Guidelines',
			        '/privacy': 'Privacy Policy',
			          '/terms': 'Term & Services',
                })[path],
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'stock',
            },
        },
    },
    Search:     {
        config:     {
            name:        'results',
            scheme:      '/results/',
            title:       'Search Results',
            description: 'Searching User & Providers',
            accessor:     false,
            restrict:    { true: null, false: 'login' },
            page:        {
                title:      (path) => 'Search Results',
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'stock',
            },
        },
    },
    Settings:   {
        config:     {
            name:        'settings',
            scheme:      '/settings/',
            title:       'Settings Page',
            description: 'User Settings Access',
            accessor:     false,
            restrict:    { true: null, false: 'login' },
            page:        {
                title:      (path, usr) => `Settings | ${Object.values(((usr||{}).Profile||{}).Name||{}).join(' ')}`,
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'cover',
            },
        },
    },
    Update:   {
        config:     {
            name:        'update',
            scheme:      '/update/',
            title:       'Update Page',
            description: 'User Update Access',
            accessor:     false,
            restrict:    { true: null, false: 'login' },
            page:        {
                title:      (path, usr) => `Update | ${Object.values(((usr||{}).Profile||{}).Name||{}).join(' ')}`,
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'cover',
            },
        },
    },
    Services:   {
        config:     {
            name:        'services',
            scheme:      '/services/',
            title:       'Services Page',
            description: 'Service Provide Access',
            accessor:     false,
            restrict:    { true: null, false: 'login' },
            page:        {
                title:      (path, usr) => `Services | ${Object.values(((usr||{}).Profile||{}).Name||{}).join(' ')}`,
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'cover',
            },
        },
    },
    Profile:    {
        config:     {
            name:        'profile',
            scheme:      '/(([\\w_-]|\\.(?!html?|je?pg|pdf|gif|svg|ico|png|(doc|xls|ppt)x?))+|profile)/',
            title:       'Profile Page',
            description: 'Displaying User Profiles',
            accessor:     false,
            restrict:    { true: null, false: 'login' },
            errorIF:     (ret) => (Object.keys(ret).length==0),
            page:        {
                title:      (path,usr,pay) => `Profile | ${Object.values((pay||{}).name||[]).join(' ')}`,
                CSS:        ['style'],
                styles:      false,
                main:       'evectr',
                type:       'cover',
            },
        },
    },
};
