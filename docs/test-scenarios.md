# EventHub Test Scenario Inventory

Generated from live Playwright MCP exploration on 24 July 2026 and cross-checked with the attached Pytest framework.

## Initial UI Automation Scope

### Authentication

1. Login page renders email, password, Sign In, Register, and API Documentation links.
2. Registered user can sign in and see authenticated navigation.
3. User can log out and return to the login page.
4. Empty credentials keep the user on the login page with validation.
5. Invalid credentials display an authentication error.
6. Anonymous users are redirected from protected routes to login.

### Home And Navigation

1. Authenticated header shows Home, Events, My Bookings, API Docs, Admin, user email, and Logout.
2. Home page shows the hero, featured events, Browse Events CTA, and My Bookings CTA.
3. Header navigation opens Events, My Bookings, Admin Events, and API Docs.

### Event Discovery

1. Events page renders search, category filter, city filter, and event cards.
2. Seed events are visible: Dilli Diwali Mela, Hollywood Monsoon Night, World Tech Summit.
3. Search by event title returns matching events.
4. Search by unmatched text shows the empty state.
5. Category filter narrows event results.
6. City filter narrows event results.
7. Combined category and city filters return the expected intersection.
8. Event card shows category, featured badge, date, venue/city, price, seats left, and Book Now.

### Event Details And Booking

1. Event details page shows title, category, featured badge, event metadata, description, price, and booking panel.
2. Ticket quantity starts at one.
3. Incrementing tickets updates count and total.
4. Ticket quantity cannot exceed available seats.
5. Booking form validates full name, email, and phone number.
6. Valid booking shows confirmation with booking reference, customer, tickets, and total.
7. User can navigate from confirmation to My Bookings.

### My Bookings

1. My Bookings lists confirmed booking cards.
2. New booking appears in booking history.
3. Booking details action opens the details view.
4. User can cancel a booking.
5. User can clear all bookings for clean test data.

### Admin Event Management

1. Admin Events page renders create-event form and All Events table.
2. Seeded events are read-only.
3. Admin can create a user-managed event.
4. Created event appears in the admin table.
5. Created event appears in event discovery.
6. Required admin fields validate title, category, city, venue, date/time, price, and seats.
7. User-created event limit of six records is respected.

## Future Hybrid API Scenarios

1. Login API returns a token for valid credentials. Implemented.
2. Events API response includes seeded events shown in the UI. Implemented.
3. Health API confirms API and DB status. Implemented.
4. Booking API creates and cancels test bookings. Implemented.
5. Booking API cleans account data before/after stateful UI tests. Implemented for Cypress-created bookings.
6. Admin Events API creates disposable events for search/filter/edit/delete UI coverage.
7. Event detail API matches UI detail data.
8. Contract tests validate status codes, required fields, schema, and business constraints.
