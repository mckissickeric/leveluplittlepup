class AssetManager {
    constructor() {
        this.assets = {};
        this.loadingPromises = [];
        this.onCompleteCallback = null;
        
        console.log('%cLevel Up Little Pup - Asset Manager', 
            'color: #2ecc71; font-size: 14px; font-weight: bold');
        console.log('%cSome assets may show fallback graphics during development', 
            'color: #f1c40f; font-size: 12px');
    }
    
    loadImage(key, url) {
        if (this.assets[key]) {
            return;
        }
        
        const img = new Image();
        
        img.onload = () => {
            this.assets[key] = img;
        };
        
        img.onerror = () => {
            console.log(`Using fallback for: ${key}`);
        };
        
        img.src = url;
    }
    
    loadVideo(key, path) {
        const video = document.createElement('video');
        video.loop = true;
        video.muted = false;
        video.volume = 0.3;
        video.playsInline = true;
        
        const promise = new Promise((resolve, reject) => {
            video.oncanplaythrough = () => {
                this.assets[key] = video;
                resolve();
            };
            video.onerror = () => {
                console.error(`Failed to load video: ${path}`);
                reject();
            };
        });
        
        video.src = path;
        this.loadingPromises.push(promise);
        return promise;
    }
    
    onComplete(callback) {
        this.onCompleteCallback = callback;
        Promise.all(this.loadingPromises)
            .then(() => {
                if (this.onCompleteCallback) {
                    this.onCompleteCallback();
                }
            })
            .catch(error => {
                console.error('Error loading assets:', error);
                // Still call the callback so the game can show fallback graphics
                if (this.onCompleteCallback) {
                    this.onCompleteCallback();
                }
            });
    }
    
    get(key) {
        return this.assets[key];
    }
    
    get video() {
        return this.assets['video'];
    }
}
