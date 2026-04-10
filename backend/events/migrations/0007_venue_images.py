from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0006_event_view_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='venue',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='venues/'),
        ),
        migrations.CreateModel(
            name='VenueImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='venues/gallery/')),
                ('order', models.PositiveIntegerField(default=0)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('venue', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='events.venue')),
            ],
            options={
                'ordering': ['order', 'uploaded_at'],
            },
        ),
    ]
