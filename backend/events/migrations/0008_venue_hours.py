from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0007_venue_images'),
    ]

    operations = [
        migrations.AddField(model_name='venue', name='weekday_open',  field=models.TimeField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='weekday_close', field=models.TimeField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='saturday_open',  field=models.TimeField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='saturday_close', field=models.TimeField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='sunday_open',  field=models.TimeField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='sunday_close', field=models.TimeField(blank=True, null=True)),
    ]
