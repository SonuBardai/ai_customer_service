from django.conf import settings

# from storages.backends.s3boto3 import S3Boto3Storage
from django.core.files.storage import FileSystemStorage


class MediaStorage:
    def __new__(cls):
        if settings.USE_S3:
            # return S3Boto3Storage(location="media", file_overwrite=False, custom_domain=settings.AWS_S3_CUSTOM_DOMAIN, default_acl="private")
            # Implement this when we have an S3 bucket
            ...
        return FileSystemStorage(location="media")
