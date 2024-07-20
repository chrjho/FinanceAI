from rest_framework import serializers

class Serializer(serializers.ModelSerializer):
    class Meta:
        model = None
        fields = None
    
    def __init__(self, *args, **kwargs):
        model = kwargs.pop('model', None)
        fields = kwargs.pop('fields', None)
        if model:
            self.Meta.model = model
            self.Meta.fields = fields
        super().__init__(*args, **kwargs)