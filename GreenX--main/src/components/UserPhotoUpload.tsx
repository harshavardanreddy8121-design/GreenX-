import { useEffect, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function UserPhotoUpload() {
    const { profile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(profile?.avatar_url || '');

    useEffect(() => {
        setPhotoUrl(profile?.avatar_url || '');
    }, [profile?.avatar_url]);

    const uploadPhoto = async (file: File) => {
        if (!profile?.id) {
            alert('User profile is not available. Please sign in again.');
            return;
        }

        try {
            setUploading(true);

            // Create a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
            const filePath = `user-photos/${fileName}`;

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('user-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('user-photos')
                .getPublicUrl(filePath);

            // Update profile with photo URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setPhotoUrl(data.publicUrl);
            alert('Photo uploaded successfully!');
        } catch (error: any) {
            alert('Error uploading photo: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }

            uploadPhoto(file);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border border-border rounded-lg bg-card">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted">
                {photoUrl ? (
                    <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
                        <Camera className="w-12 h-12 text-muted-foreground" />
                    </div>
                )}
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                />
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
            </label>

            <p className="text-xs text-muted-foreground text-center">
                Max size: 5MB<br />JPG, PNG supported
            </p>
        </div>
    );
}
