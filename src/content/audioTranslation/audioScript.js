/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 
* NOTE ON SCRIPT INJECTION :
 * We use script injection to access YouTube's player API directly from the page context.
 * This is necessary because the player API is not accessible from the content script context.
 * As you can see down below, the injected code only uses YouTube's official player API methods.
*/

(() => {
    const LOG_PREFIX = '[NMT-Debug]';
    const LOG_STYLES = {
        AUDIO: { context: '[AUDIO]', color: '#4CAF50' }
    };

    function createLogger(category) {
        return (message, ...args) => {
            console.log(
                `%c${LOG_PREFIX}${category.context} ${message}`,
                `color: ${category.color}`,
                ...args
            );
        };
    }

    const audioLog = createLogger(LOG_STYLES.AUDIO);

    const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese'
    };

    function setOriginalTrack() {
        const player = document.getElementById('movie_player');
        if (!player) return;

        try {
            const tracks = player.getAvailableAudioTracks();
            audioLog('Available tracks:', tracks);
            
            const originalTrack = tracks.find(track => {
                const base64Part = track.id.split(';')[1];
                const decoded = atob(base64Part);
                return decoded.includes('original');
            });
            
            if (originalTrack) {
                const base64Part = originalTrack.id.split(';')[1];
                const decoded = atob(base64Part);
                const langMatch = decoded.match(/lang..([-a-zA-Z]+)/);
                
                const langCode = langMatch ? langMatch[1].split('-')[0] : 'unknown';
                const languageName = languageNames[langCode] || langCode.toUpperCase();
                
                audioLog('Setting audio to original language: ' + languageName);
                player.setAudioTrack(originalTrack);
            }
        } catch (error) {
            console.error('[YT-DEBUG] Error:', error);
        }
    }

    const player = document.getElementById('movie_player');
    if (player) {
        player.addEventListener('onVideoDataChange', () => {
            audioLog('Video data changed, checking audio tracks...');
            setOriginalTrack();
        });
    }
})();
