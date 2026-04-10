from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0005_eventimage'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='view_count',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
