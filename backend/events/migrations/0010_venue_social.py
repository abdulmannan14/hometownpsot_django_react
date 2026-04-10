from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0009_venue_24h'),
    ]

    operations = [
        migrations.AddField(model_name='venue', name='facebook',  field=models.URLField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='instagram', field=models.URLField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='twitter',   field=models.URLField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='youtube',   field=models.URLField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='tiktok',    field=models.URLField(blank=True, null=True)),
        migrations.AddField(model_name='venue', name='linkedin',  field=models.URLField(blank=True, null=True)),
    ]
