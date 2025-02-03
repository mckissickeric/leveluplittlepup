<?php
function level_up_game_shortcode() {
    // Get the uploads directory URL
    $upload_dir = wp_upload_dir();
    $game_base_url = $upload_dir['baseurl'] . '/2025/game';
    
    ob_start();
    ?>
    <div id="game-container">
        <h1 style="color: #2ecc71; font-size: 2.5em; margin-bottom: 15px;">Level Up Little Pup!</h1>
        <div id="canvas-container"></div>
        <div class="instructions">
            <h2>How to Play:</h2>
            <ul>
                <li>Use Arrow Keys to move left/right</li>
                <li>Hold SPACE to boost upward</li>
                <li>Collect green items for points</li>
                <li>Avoid red items</li>
                <li>Complete all levels to win!</li>
            </ul>
        </div>
        <div id="mobile-warning">
            <p>This game is best played on a computer with a keyboard. Mobile devices are not supported.</p>
        </div>
    </div>

    <style>
        #game-container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            font-family: Arial, sans-serif;
        }
        #canvas-container {
            position: relative;
            width: 100%;
            height: 600px;
            background: #1a1a1a;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            margin: 20px 0;
        }
        .instructions {
            margin: 20px auto;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: left;
            max-width: 800px;
        }
        .instructions h2 {
            color: #2ecc71;
            margin-bottom: 15px;
        }
        .instructions ul {
            list-style: none;
            padding: 0;
        }
        .instructions li {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
        }
        .instructions li:before {
            content: "→";
            color: #2ecc71;
            position: absolute;
            left: 0;
        }
        #mobile-warning {
            display: none;
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px auto;
            text-align: center;
        }
        @media (max-width: 768px) {
            #mobile-warning {
                display: block;
            }
        }
    </style>

    <!-- Load game scripts -->
    <script src="<?php echo esc_url($game_base_url); ?>/js/assetManager.js"></script>
    <script src="<?php echo esc_url($game_base_url); ?>/js/background.js"></script>
    <script src="<?php echo esc_url($game_base_url); ?>/js/particleSystem.js"></script>
    <script src="<?php echo esc_url($game_base_url); ?>/js/powerups.js"></script>
    <script src="<?php echo esc_url($game_base_url); ?>/js/rocket.js"></script>
    <script src="<?php echo esc_url($game_base_url); ?>/js/game.js"></script>

    <script>
        window.addEventListener('load', function() {
            try {
                // Set up game configuration with correct paths
                window.gameConfig = {
                    basePath: '<?php echo esc_js($game_base_url); ?>',
                    assets: {
                        video: '<?php echo esc_js($game_base_url); ?>/assets/rocketpup_animated.mp4',
                        sounds: {
                            gameOver: '<?php echo esc_js($game_base_url); ?>/assets/sounds/game_over.mp3',
                            happyBark: '<?php echo esc_js($game_base_url); ?>/assets/happy_bark.mp3',
                            yelp: '<?php echo esc_js($game_base_url); ?>/assets/dog_yelp.mp3'
                        },
                        images: {
                            rocketSprite: '<?php echo esc_js($game_base_url); ?>/assets/rocketpup_sprite.png'
                        },
                        blankie: '<?php echo esc_js($game_base_url); ?>/assets/Blankie'
                    }
                };

                // Create game instance
                const game = new Game();
                
                // Handle window focus/blur
                window.addEventListener('blur', () => {
                    if (game.pause) game.pause();
                });
                
                window.addEventListener('focus', () => {
                    if (game.resume) game.resume();
                });
                
                // Prevent spacebar from scrolling
                window.addEventListener('keydown', function(e) {
                    if(e.code === 'Space' && e.target === document.body) {
                        e.preventDefault();
                    }
                });
            } catch (error) {
                console.error('Error initializing game:', error);
            }
        });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('level_up_game', 'level_up_game_shortcode');
?>