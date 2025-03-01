// Define available achievements
const achievements = [
    {
        id: 'first-lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: 'award',
        condition: (userState) => userState.completedLessons.length >= 1,
        coinReward: 5
    },
    {
        id: 'streak-3',
        title: 'Consistent Learner',
        description: 'Learn 3 days in a row',
        icon: 'fire',
        condition: (userState) => userState.streak >= 3,
        coinReward: 10
    },
    {
        id: 'all-intro',
        title: 'Basics Mastered',
        description: 'Complete all introductory lessons',
        icon: 'star',
        condition: (userState) => {
            const introLessons = lessons.filter(lesson => lesson.category === 'intro');
            return introLessons.every(lesson => userState.completedLessons.includes(lesson.id));
        },
        coinReward: 15
    },
    {
        id: 'fast-learner',
        title: 'Fast Learner',
        description: 'Complete 3 lessons in a single day',
        icon: 'bolt',
        condition: (userState) => {
            const today = new Date().toDateString();
            const todayCompletions = userState.completedLessons.filter(
                lessonId => {
                    const completionDate = userState.completionDates?.[lessonId];
                    return completionDate && new Date(completionDate).toDateString() === today;
                }
            );
            return todayCompletions.length >= 3;
        },
        coinReward: 20
    },
    {
        id: 'code-master',
        title: 'Code Master',
        description: 'Submit 10 correct code solutions',
        icon: 'code',
        condition: (userState) => userState.correctSubmissions >= 10,
        coinReward: 30
    },
    {
        id: 'half-way',
        title: 'Halfway There',
        description: 'Complete 50% of all lessons',
        icon: 'route',
        condition: (userState) => {
            return userState.completedLessons.length >= Math.ceil(lessons.length / 2);
        },
        coinReward: 25
    },
    {
        id: 'graduation',
        title: 'AI Graduate',
        description: 'Complete all available lessons',
        icon: 'graduation-cap',
        condition: (userState) => {
            return userState.completedLessons.length >= lessons.length;
        },
        coinReward: 100
    }
];

/**
 * Check if user has unlocked any new achievements
 */
function checkAchievements() {
    if (!userState) return;
    
    // Initialize achievements array if it doesn't exist
    if (!userState.achievements) {
        userState.achievements = [];
    }
    
    // Check each achievement
    achievements.forEach(achievement => {
        // Skip if already unlocked
        if (userState.achievements.includes(achievement.id)) {
            return;
        }
        
        // Check if condition is met
        if (achievement.condition(userState)) {
            // Unlock the achievement
            userState.achievements.push(achievement.id);
            
            // Award coins
            if (achievement.coinReward) {
                awardCoins(achievement.coinReward, `unlocking "${achievement.title}"`);
            }
            
            // Show achievement notification
            showAchievementNotification(achievement);
            
            // Save updated user state
            saveUserState();
        }
    });
    
    // Update achievements display
    updateAchievementsUI();
}

/**
 * Show achievement notification
 * @param {Object} achievement - The achievement that was unlocked
 */
function showAchievementNotification(achievement) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification achievement';
    notification.innerHTML = `
        <i class="fas fa-${achievement.icon}"></i>
        <div class="achievement-details">
            <h3>Achievement Unlocked: ${achievement.title}</h3>
            <p>${achievement.description}</p>
            <p class="achievement-reward">+${achievement.coinReward} coins</p>
        </div>
    `;
    
    document.getElementById('notification-container').appendChild(notification);
    
    // Add sound effect if enabled
    playSoundEffect('achievement');
    
    // Remove notification after 8 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 8000);
}

/**
 * Update the achievements UI in the profile section
 */
function updateAchievementsUI() {
    const achievementsContainer = document.getElementById('achievements-list');
    if (!achievementsContainer) return;
    
    achievementsContainer.innerHTML = '';
    
    if (!userState.achievements || userState.achievements.length === 0) {
        achievementsContainer.innerHTML = '<p>No achievements unlocked yet. Keep learning!</p>';
        return;
    }
    
    // Create list of unlocked achievements
    const unlockedAchievements = userState.achievements.map(id => 
        achievements.find(a => a.id === id)
    ).filter(Boolean);
    
    unlockedAchievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement-item';
        achievementElement.innerHTML = `
            <i class="fas fa-${achievement.icon}"></i>
            <div class="achievement-info">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                <span class="achievement-reward">+${achievement.coinReward} coins</span>
            </div>
        `;
        achievementsContainer.appendChild(achievementElement);
    });
    
    // Add locked achievements as dimmed out
    const lockedAchievements = achievements.filter(
        a => !userState.achievements.includes(a.id)
    );
    
    if (lockedAchievements.length > 0) {
        const lockedSection = document.createElement('div');
        lockedSection.className = 'locked-achievements';
        lockedSection.innerHTML = '<h4>Locked Achievements</h4>';
        achievementsContainer.appendChild(lockedSection);
        
        lockedAchievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-item locked';
            achievementElement.innerHTML = `
                <i class="fas fa-${achievement.icon}"></i>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-reward">+${achievement.coinReward} coins</span>
                </div>
            `;
            lockedSection.appendChild(achievementElement);
        });
    }
    
    // Show achievement progress
    const progressElement = document.createElement('div');
    progressElement.className = 'achievement-progress';
    const percentage = Math.round((userState.achievements.length / achievements.length) * 100);
    progressElement.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p>${userState.achievements.length}/${achievements.length} achievements (${percentage}%)</p>
    `;
    achievementsContainer.appendChild(progressElement);
}

/**
 * Play a sound effect
 * @param {string} type - Type of sound effect to play
 */
function playSoundEffect(type) {
    // Check if sound is enabled in user preferences
    if (userState.preferences?.soundEffects === false) {
        return;
    }
    
    const sounds = {
        achievement: '/sounds/achievement.mp3',
        correct: '/sounds/correct.mp3',
        incorrect: '/sounds/incorrect.mp3',
        coin: '/sounds/coin.mp3'
    };
    
    if (sounds[type]) {
        const sound = new Audio(sounds[type]);
        sound.volume = 0.5;
        sound.play().catch(e => {
            console.log('Sound playback failed:', e);
        });
    }
}

// Export achievement functions
window.checkAchievements = checkAchievements;
window.updateAchievementsUI = updateAchievementsUI;
