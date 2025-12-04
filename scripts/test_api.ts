const API_URL = 'http://localhost:3000/api/v1';

async function request(url: string, method: string, body?: any, token?: string) {
    const headers: any = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options: any = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || data.error || res.statusText);
    }

    return data;
}

async function runTests() {
    try {
        console.log('Starting API Verification...');

        // 1. Register User A (Organizer)
        console.log('\n1. Registering Organizer...');
        const organizerEmail = `organizer_${Date.now()}@test.com`;
        const organizerRes = await request(`${API_URL}/auth/register`, 'POST', {
            name: 'Organizer',
            email: organizerEmail,
            password: 'password123'
        });
        console.log('Organizer Registered:', organizerRes.message);

        // 2. Login User A
        console.log('\n2. Logging in Organizer...');
        const loginRes = await request(`${API_URL}/auth/login`, 'POST', {
            email: organizerEmail,
            password: 'password123'
        });
        const token = loginRes.token;
        console.log('Organizer Logged In. Token received.');

        // 3. Create Event
        console.log('\n3. Creating Event...');
        const eventRes = await request(`${API_URL}/event`, 'POST', {
            title: 'Tech Conference 2024',
            description: 'A conference about tech.',
            date: new Date().toISOString(),
            location: 'Virtual',
            price: 0,
            numberOfTickets: 100
        }, token);
        const eventId = eventRes.event.id;
        console.log('Event Created:', eventId);

        // 4. Register User B (Attendee)
        console.log('\n4. Registering Attendee...');
        const attendeeEmail = `attendee_${Date.now()}@test.com`;
        await request(`${API_URL}/auth/register`, 'POST', {
            name: 'Attendee',
            email: attendeeEmail,
            password: 'password123'
        });
        console.log('Attendee Registered.');

        // 5. Login User B
        console.log('\n5. Logging in Attendee...');
        const attendeeLoginRes = await request(`${API_URL}/auth/login`, 'POST', {
            email: attendeeEmail,
            password: 'password123'
        });
        const attendeeToken = attendeeLoginRes.token;
        console.log('Attendee Logged In.');

        // 6. Register User B for Event
        console.log('\n6. Registering Attendee for Event...');
        const registerRes = await request(`${API_URL}/event/${eventId}/register`, 'POST', {}, attendeeToken);
        console.log('Attendee Registered for Event:', registerRes.message);

        // 7. Get Events
        console.log('\n7. Fetching Events...');
        const eventsRes = await request(`${API_URL}/event`, 'GET', undefined, token);
        console.log('Events fetched:', eventsRes.events.length);

        // 8. Get Created Events (Organizer)
        console.log('\n8. Fetching Created Events (Organizer)...');
        const createdEventsRes = await request(`${API_URL}/event/created`, 'GET', undefined, token);
        console.log('Created Events:', createdEventsRes.events.length);
        if (createdEventsRes.events.length === 0) throw new Error("No created events found");

        // 9. Get Registered Events (Attendee)
        console.log('\n9. Fetching Registered Events (Attendee)...');
        const registeredEventsRes = await request(`${API_URL}/event/registered`, 'GET', undefined, attendeeToken);
        console.log('Registered Events:', registeredEventsRes.events.length);
        if (registeredEventsRes.events.length === 0) throw new Error("No registered events found");

        // 10. Delete Event
        console.log('\n10. Deleting Event...');
        await request(`${API_URL}/event/${eventId}`, 'DELETE', undefined, token);
        console.log('Event Deleted.');

        console.log('\nAll tests passed successfully!');

    } catch (error: any) {
        console.error('Test Failed:', error);
    }
}

runTests();
