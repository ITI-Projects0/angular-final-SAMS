import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-video-viewer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-viewer.html',
    styleUrl: './video-viewer.css'
})
export class VideoViewer implements OnInit {
    private route = inject(ActivatedRoute);
    private sanitizer = inject(DomSanitizer);

    videoUrl: SafeResourceUrl | null = null;
    videoTitle: string = '';
    allVideos: any[] = [];

    ngOnInit() {
        // Get video URL from query params
        const url = this.route.snapshot.queryParamMap.get('url');
        this.videoTitle = this.route.snapshot.queryParamMap.get('title') || 'Video';

        if (url) {
            const youtubeId = this.extractYouTubeId(url);
            if (youtubeId) {
                this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                    `https://www.youtube.com/embed/${youtubeId}`
                );
            }
        }

        // Mock: Get all videos for this lesson/class (would come from service)
        this.allVideos = [
            { id: 1, title: 'Algebra Basics', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: true },
            { id: 2, title: 'Variables Explained', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: false },
            { id: 3, title: 'Solving Linear Equations', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', active: false }
        ];
    }

    extractYouTubeId(url: string): string | null {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    }

    playVideo(video: any) {
        const youtubeId = this.extractYouTubeId(video.url);
        if (youtubeId) {
            this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                `https://www.youtube.com/embed/${youtubeId}`
            );
            this.videoTitle = video.title;
            this.allVideos.forEach(v => v.active = v.id === video.id);
        }
    }
}
