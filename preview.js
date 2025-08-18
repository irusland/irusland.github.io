// Auto-generating PNG preview script
(function() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    function generatePreviewImage() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add glassmorphism effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(100, 80, 600, 240);
        
        // Add border with rounded corners effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 80, 600, 240);
        
        // Add title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('🌐 Personal Website', 400, 150);
        
        // Reset shadow for other text
        ctx.shadowColor = 'transparent';
        
        // Add subtitle
        ctx.font = '22px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('Portfolio & Projects', 400, 185);
        
        // Add URL container
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(275, 210, 250, 50);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.strokeRect(275, 210, 250, 50);
        
        // Add URL text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('irusland.github.io', 400, 240);
        
        // Add call to action
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('Click to visit website', 400, 280);
        
        // Add decorative elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(150, 120, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(650, 280, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        return canvas;
    }

    // Check if page should serve PNG
    const urlParams = new URLSearchParams(window.location.search);
    const servePNG = urlParams.get('format') === 'png' || urlParams.get('png') === '1';
    
    if (servePNG) {
        // Generate and serve PNG
        const canvas = generatePreviewImage();
        
        // Replace page content with PNG
        document.addEventListener('DOMContentLoaded', function() {
            canvas.toBlob(function(blob) {
                // Clear page
                document.body.innerHTML = '';
                document.head.innerHTML = '<meta charset="UTF-8"><title>Website Preview</title>';
                
                // Create and display image
                const img = document.createElement('img');
                img.src = URL.createObjectURL(blob);
                img.style.display = 'block';
                img.style.margin = '0 auto';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                document.body.style.margin = '0';
                document.body.style.padding = '0';
                document.body.style.backgroundColor = '#000';
                document.body.appendChild(img);
            }, 'image/png', 1.0);
        });
    }
})();