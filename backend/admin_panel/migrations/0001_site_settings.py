from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='SiteSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('default_radius_miles', models.PositiveIntegerField(
                    default=10,
                    help_text="Radius (in miles) used for 'Events Near You' on the homepage."
                )),
            ],
            options={
                'verbose_name': 'Site Settings',
            },
        ),
    ]
