from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0008_venue_hours'),
    ]

    operations = [
        migrations.AddField(model_name='venue', name='weekday_is_24h',  field=models.BooleanField(default=False)),
        migrations.AddField(model_name='venue', name='saturday_is_24h', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='venue', name='sunday_is_24h',   field=models.BooleanField(default=False)),
    ]
