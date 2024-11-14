const config = {
    baseUrl: 'https://api.engoo.com/api/lesson_headers',
    params: {
        allow_license_partners: ['associatedPress'],
        category: '0225ae09-5d63-41c2-bd75-693985d07d78',
        direction: 'desc',
        max_level: 10,
        min_level: 5,
        order: 'last_published_at',
        page_size: 1,
        published_latest: true,
        query: '',
        type: 'Published'
    }
};

export default config;