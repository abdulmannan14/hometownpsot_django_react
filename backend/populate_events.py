import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from events.models import Event, Category
from users.models import User

# Get or create categories
categories_data = [
    {'name': 'Nightlife', 'slug': 'nightlife'},
    {'name': 'Concert', 'slug': 'concert'},
    {'name': 'Comedy', 'slug': 'comedy'},
    {'name': 'Sports', 'slug': 'sports'},
    {'name': 'Festival', 'slug': 'festival'},
    {'name': 'Community', 'slug': 'community'},
]

categories = {}
for cat_data in categories_data:
    cat, _ = Category.objects.get_or_create(name=cat_data['name'], defaults={'slug': cat_data['slug']})
    categories[cat_data['name']] = cat

# Get or create a default organizer
organizer, _ = User.objects.get_or_create(
    username='reno_events',
    defaults={
        'email': 'events@renohometownpost.com',
        'role': 'user',
        'is_active': True
    }
)

# Sample events data from Reno venues
events_data = [
    {
        'title': 'Live Jazz Night at The Alpine',
        'description': 'Experience smooth jazz with local musicians at The Alpine. Enjoy craft cocktails and a vibrant atmosphere.',
        'location': '324 E 4th St, Reno, NV 89512',
        'city': 'Reno',
        'category': 'Nightlife',
        'organizer_name': 'The Alpine',
        'organizer_email': 'info@thealpine.com',
        'organizer_phone': '(775) 555-0101',
        'website': 'https://thealpine.com',
        'is_featured': True,
    },
    {
        'title': 'Rock Concert Series - The Wildest',
        'description': 'The hottest rock bands in the region perform live at Cargo Concert Hall. High energy, great music, and unforgettable nights.',
        'location': '255 N Virginia St, Reno, NV 89501',
        'city': 'Reno',
        'category': 'Concert',
        'organizer_name': 'Cargo Concert Hall',
        'organizer_email': 'bookings@cargoconcerthall.com',
        'organizer_phone': '(775) 555-0102',
        'website': 'https://cargoconcerthall.com',
        'is_featured': True,
    },
    {
        'title': 'Comedy Night at Virginia Street Brewhouse',
        'description': 'Laugh out loud with top comedians. Enjoy craft beers and great laughs in an intimate setting.',
        'location': '211 N Virginia Street Reno, NV 89501',
        'city': 'Reno',
        'category': 'Comedy',
        'organizer_name': 'Virginia Street Brewhouse',
        'organizer_email': 'events@vstbrewhouse.com',
        'organizer_phone': '(775) 555-0103',
        'website': 'https://vstbrewhouse.com',
        'is_featured': False,
    },
    {
        'title': 'Electronic Dance Music Festival',
        'description': 'Three days of non-stop EDM with international DJs. The biggest dance music event of the year in Reno.',
        'location': '2500 E 2nd St Reno, NV 89595',
        'city': 'Reno',
        'category': 'Festival',
        'organizer_name': 'Grand Sierra Resort',
        'organizer_email': 'events@grandsierra.com',
        'organizer_phone': '(775) 555-0104',
        'website': 'https://grandsierra.com',
        'is_featured': True,
    },
    {
        'title': 'Live Reggae Night at Cypress Reno',
        'description': 'Feel the island vibes with live reggae band. Tropical themed cocktails and great summer energy.',
        'location': '761 S. Virginia St. Reno, NV 89501',
        'city': 'Reno',
        'category': 'Nightlife',
        'organizer_name': 'Cypress Reno',
        'organizer_email': 'info@cypressreno.com',
        'organizer_phone': '(775) 555-0105',
        'website': 'https://cypressreno.com',
        'is_featured': False,
    },
    {
        'title': 'Reno Music & Arts Festival',
        'description': 'Celebrate local and regional talent. Live music, art installations, food vendors, and more.',
        'location': '299 E Plumb Ln, Reno, NV 89502',
        'city': 'Reno',
        'category': 'Festival',
        'organizer_name': 'Reno Public Market',
        'organizer_email': 'hello@renopublicmarket.com',
        'organizer_phone': '(775) 555-0106',
        'website': 'https://renopublicmarket.com',
        'is_featured': True,
    },
    {
        'title': 'Live Country Music at The Polo Lounge',
        'description': 'Saddle up for an evening of live country music and dancing. Full bar with signature cocktails.',
        'location': '1559 S Virginia St, Reno, Nevada 89502',
        'city': 'Reno',
        'category': 'Nightlife',
        'organizer_name': 'The Polo Lounge',
        'organizer_email': 'events@pololounge.com',
        'organizer_phone': '(775) 555-0107',
        'website': 'https://pololounge.com',
        'is_featured': False,
    },
    {
        'title': 'Underground Hip-Hop Night',
        'description': 'Experience the underground hip-hop scene. Local DJs, turntablists, and performers.',
        'location': '555 E 4th St, Reno, NV 89512',
        'city': 'Reno',
        'category': 'Nightlife',
        'organizer_name': 'Club Underground',
        'organizer_email': 'bookings@clubunderground.com',
        'organizer_phone': '(775) 555-0108',
        'website': 'https://clubunderground.com',
        'is_featured': False,
    },
    {
        'title': 'Community Theater Production - A Midsummer Night Dream',
        'description': 'Classic Shakespeare brought to life by talented local actors. A magical theatrical experience.',
        'location': '100 S Virginia St, Reno, NV 89501',
        'city': 'Reno',
        'category': 'Community',
        'organizer_name': 'Pioneer Center for the Arts',
        'organizer_email': 'info@pioneercenter.com',
        'organizer_phone': '(775) 555-0109',
        'website': 'https://pioneercenter.com',
        'is_featured': True,
    },
    {
        'title': 'Alternative Band Night at Dead Ringer Analog Bar',
        'description': 'Indie and alternative bands take the stage. Vinyl records spin between live sets. Authentic analog experience.',
        'location': '432 E 4th St, Reno, NV 89512',
        'city': 'Reno',
        'category': 'Nightlife',
        'organizer_name': 'Dead Ringer Analog Bar',
        'organizer_email': 'events@deadringerbar.com',
        'organizer_phone': '(775) 555-0110',
        'website': 'https://deadringerbar.com',
        'is_featured': False,
    },
]

# Create events
created_count = 0
for i, event_data in enumerate(events_data[:10]):
    # Generate dates spread over the next 60 days
    days_offset = (i * 6) + random.randint(1, 5)
    event_date = datetime.now() + timedelta(days=days_offset)
    event_date = event_date.replace(hour=19, minute=0, second=0)
    end_date = event_date + timedelta(hours=3)
    
    event = Event.objects.create(
        title=event_data['title'],
        description=event_data['description'],
        date=event_date,
        end_date=end_date,
        location=event_data['location'],
        city=event_data['city'],
        category=categories[event_data['category']],
        organizer=organizer,
        organizer_name=event_data['organizer_name'],
        organizer_email=event_data['organizer_email'],
        organizer_phone=event_data['organizer_phone'],
        website=event_data['website'],
        status='approved',  # Auto-approve these events
        is_featured=event_data['is_featured'],
    )
    created_count += 1
    print(f"✅ Created: {event.title} - {event.date.strftime('%B %d, %Y at %I:%M %p')}")

print(f"\n✨ Successfully created {created_count} events!")
