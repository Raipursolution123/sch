from django.db import models


class FrontCmsSettings(models.Model):
    """Maps to `front_cms_settings` in db_current."""

    id = models.AutoField(primary_key=True)
    theme = models.CharField(max_length=50, blank=True, null=True)
    is_active_rtl = models.IntegerField(blank=True, null=True, default=0)
    is_active_front_cms = models.IntegerField(blank=True, null=True, default=0)
    is_active_sidebar = models.IntegerField(blank=True, null=True, default=0)
    logo = models.CharField(max_length=200, blank=True, null=True)
    contact_us_email = models.CharField(max_length=100, blank=True, null=True)
    complain_form_email = models.CharField(max_length=100, blank=True, null=True)
    sidebar_options = models.TextField()
    whatsapp_url = models.CharField(max_length=255)
    fb_url = models.CharField(max_length=200)
    twitter_url = models.CharField(max_length=200)
    youtube_url = models.CharField(max_length=200)
    google_plus = models.CharField(max_length=200)
    instagram_url = models.CharField(max_length=200)
    pinterest_url = models.CharField(max_length=200)
    linkedin_url = models.CharField(max_length=200)
    google_analytics = models.TextField(blank=True, null=True)
    footer_text = models.CharField(max_length=500, blank=True, null=True)
    cookie_consent = models.CharField(max_length=255)
    fav_icon = models.CharField(max_length=250, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "front_cms_settings"

    def __str__(self):
        return f"FrontCmsSettings {self.pk}"
