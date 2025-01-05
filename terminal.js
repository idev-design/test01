// Terminal Class Definition
class Terminal {
    constructor() {
        // DOM Elements
        this.terminal = document.getElementById('terminal');
        this.input = document.querySelector('.input-field');
        
        // State Management
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.isProcessing = false;
        
        // Command Configuration
        this.commandAliases = {
            'ls': 'help',
            'hi': 'about',
            '?': 'help',
            'cls': 'clear'
        };

        // Portfolio Content
        this.portfolioContent = {
            about: {
                title: 'About Me',
                icon: 'person',
                content: `I'm a Database Administrator with over 5 years of experience in designing, implementing, and maintaining enterprise-level database systems. Specializing in Oracle and SQL Server, I focus on performance optimization, high availability, and security.`
            },
            skills: {
                title: 'Technical Skills',
                icon: 'lightbulb',
                content: [
                    'â€¢ Database Management: Oracle, SQL Server, PostgreSQL',
                    'â€¢ Performance Tuning: Query optimization, indexing strategies',
                    'â€¢ High Availability: RAC, Always On, replication',
                    'â€¢ Backup & Recovery: RMAN, SQL backup, point-in-time recovery',
                    'â€¢ Scripting: Python, PowerShell, Bash',
                    'â€¢ Monitoring: OEM, SCOM, custom monitoring solutions'
                ]
            },
            projects: {
                title: 'Recent Projects',
                icon: 'folder',
                content: [
                    'â€¢ Database Migration Project - Led migration of 50TB database to cloud',
                    'â€¢ Performance Optimization - Improved query response time by 40%',
                    'â€¢ Automated Backup Solution - Developed custom backup verification system',
                    'â€¢ High Availability Setup - Implemented Always On AG for critical databases'
                ]
            },
            contact: {
                title: 'Contact Information',
                icon: 'email',
                content: [
                    'â€¢ Email: john.dba@example.com',
                    'â€¢ LinkedIn: linkedin.com/in/johndba',
                    'â€¢ GitHub: github.com/johndba'
                ]
            }
        };

        // Initialize
        this.setupListeners();
        this.setupClock();
        this.setupMenus();
    }

    // Event Listeners Setup
    setupListeners() {
        // Input handling
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Window controls
        document.querySelector('.close').addEventListener('click', () => this.handleClose());
        document.querySelector('.maximize').addEventListener('click', () => this.handleMaximize());
        document.querySelector('.minimize').addEventListener('click', () => this.handleMinimize());
        
        // Focus management
        this.input.addEventListener('blur', () => {
            if (!document.querySelector('.dropdown-menu.show')) {
                setTimeout(() => this.input.focus(), 10);
            }
        });

        // Prevent unwanted browser shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Backspace' && e.target === document.body) ||
                (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
            }
        });

        // Terminal click handling
        this.terminal.addEventListener('click', () => this.input.focus());

        // Keyboard accessibility for window controls
        document.querySelectorAll('.window-button').forEach(button => {
            button.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    // Menu System Setup
    setupMenus() {
        const panelLeft = document.querySelector('.panel-left');
        const menuStructure = [
            {
                id: 'activities',
                label: 'Activities',
                icon: 'apps',
                items: [
                    { icon: 'person', label: 'About Me', command: 'about' },
                    { icon: 'lightbulb', label: 'Skills', command: 'skills' },
                    { icon: 'folder', label: 'Projects', command: 'projects' },
                    { icon: 'email', label: 'Contact', command: 'contact' }
                ]
            },
            {
                id: 'applications',
                label: 'Applications',
                icon: 'grid_view',
                items: [
                    { icon: 'terminal', label: 'Terminal', command: 'clear' },
                    { icon: 'help', label: 'Help', command: 'help' }
                ]
            }
        ];

        menuStructure.forEach(menu => this.createMenu(menu, panelLeft));
        this.setupMenuHandlers();
    }

    // Menu Creation
    createMenu({ id, label, icon, items }, container) {
        const menuButton = document.createElement('div');
        menuButton.className = 'menu-button';
        menuButton.id = `${id}-button`;
        menuButton.setAttribute('role', 'button');
        menuButton.setAttribute('tabindex', '0');
        menuButton.setAttribute('aria-haspopup', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
        
        const menuHtml = `
            <span class="material-icons">${icon}</span>
            ${label}
            <div class="dropdown-menu" id="${id}-menu" role="menu">
                ${items.map(item => `
                    <div class="menu-item" 
                         role="menuitem" 
                         tabindex="0" 
                         data-command="${item.command}">
                        <span class="material-icons">${item.icon}</span>
                        ${item.label}
                    </div>
                `).join('')}
            </div>
        `;
        
        menuButton.innerHTML = menuHtml;
        container.appendChild(menuButton);
    }

    // Menu Event Handlers
    setupMenuHandlers() {
        const menus = document.querySelectorAll('.dropdown-menu');
        const overlay = document.querySelector('.overlay');
        const menuButtons = document.querySelectorAll('.menu-button');

        const closeMenus = () => {
            menus.forEach(menu => menu.classList.remove('show'));
            overlay.classList.remove('show');
            menuButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
        };

        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const menu = button.querySelector('.dropdown-menu');
                const isOpen = menu.classList.contains('show');
                
                closeMenus();
                
                if (!isOpen) {
                    menu.classList.add('show');
                    overlay.classList.add('show');
                    button.setAttribute('aria-expanded', 'true');
                }
            });

            // Keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });

        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const command = item.dataset.command;
                this.executeCommand(command);
                closeMenus();
            });

            // Keyboard accessibility
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });

        document.addEventListener('click', closeMenus);
        overlay.addEventListener('click', closeMenus);
    }

    // Input Handling
    handleInput(e) {
        if (this.isProcessing) return;

        switch (e.key) {
            case 'Enter':
                this.handleEnter(e);
                break;
            case 'ArrowUp':
                this.handleArrowUp(e);
                break;
            case 'ArrowDown':
                this.handleArrowDown(e);
                break;
            case 'Tab':
                this.handleTab(e);
                break;
            case 'c':
                if (e.ctrlKey) this.handleCtrlC();
                break;
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.clear();
                }
                break;
        }
    }

    handleEnter(e) {
        e.preventDefault();
        const command = this.input.value.trim().toLowerCase();
        
        if (command) {
            if (this.history.length >= this.maxHistorySize) {
                this.history.shift();
            }
            this.history.push(command);
            this.historyIndex = this.history.length;
            
            const actualCommand = this.commandAliases[command] || command;
            this.executeCommand(actualCommand);
        }
        
        this.input.value = '';
    }

    handleArrowUp(e) {
        e.preventDefault();
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.input.value = this.history[this.historyIndex];
            this.moveCursorToEnd();
        }
    }

    handleArrowDown(e) {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.input.value = this.history[this.historyIndex];
        } else {
            this.historyIndex = this.history.length;
            this.input.value = '';
        }
    }

    handleTab(e) {
        e.preventDefault();
        const input = this.input.value.toLowerCase();
        const commands = ['help', 'about', 'skills', 'projects', 'contact', 'clear', 'exit'];
        const matches = commands.filter(cmd => cmd.startsWith(input));

        if (matches.length === 1) {
            this.input.value = matches[0];
            this.moveCursorToEnd();
        } else if (matches.length > 1) {
            this.addLine(`Available commands: ${matches.join(', ')}`);
        }
    }

    handleCtrlC() {
        this.addLine(`<span class="prompt">john@portfolio:~$</span> ${this.input.value}`);
        this.addLine('^C');
        this.input.value = '';
    }

    // Command Execution
    async executeCommand(command) {
        try {
            this.isProcessing = true;
            this.addLine(`<span class="prompt">john@portfolio:~$</span> <span class="command-history">${command}</span>`);

            const commands = {
                help: () => this.showHelp(),
                about: () => this.showContent('about'),
                skills: () => this.showContent('skills'),
                projects: () => this.showContent('projects'),
                contact: () => this.showContent('contact'),
                clear: () => this.clear(),
                exit: () => this.handleClose()
            };

            if (commands[command]) {
                await commands[command]();
                this.showNotification(`Command executed: ${command}`);
            } else {
                this.addLine(`<span class="error">Command not found: ${command}. Type 'help' for available commands.</span>`);
            }
        } catch (error) {
            console.error('Command execution error:', error);
            this.addLine(`<span class="error">An error occurred while executing the command.</span>`);
        } finally {
            this.isProcessing = false;
            this.terminal.scrollTop = this.terminal.scrollHeight;
        }
    }

    // Content Display
    showContent(type) {
        const content = this.portfolioContent[type];
        const card = `
            <div class="content-card">
                <h3><span class="material-icons">${content.icon}</span>${content.title}</h3>
                ${Array.isArray(content.content) 
                    ? content.content.join('\n') 
                    : content.content}
            </div>
        `;
        this.addLine(card);
    }

    showHelp() {
        const help = `
            <div class="content-card">
                <h3><span class="material-icons">help</span>Available Commands</h3>
                â€¢ help     - Show this help menu
                â€¢ about    - Display information about me
                â€¢ skills   - List my technical skills
                â€¢ projects - View my recent projects
                â€¢ contact  - Get my contact information
                â€¢ clear    - Clear the terminal (Ctrl+L)
                â€¢ exit     - Close the terminal

                Keyboard Shortcuts:
                â€¢ Up/Down  - Navigate command history
                â€¢ Tab      - Auto-complete commands
                â€¢ Ctrl+C   - Cancel current command
                â€¢ Ctrl+L   - Clear terminal
            </div>
        `;
        this.addLine(help);
    }

    // Helper Methods
    addLine(content) {
        const line = document.createElement('div');
        line.className = 'line';
        line.innerHTML = content;
        this.terminal.insertBefore(line, this.terminal.lastElementChild);
    }

    moveCursorToEnd() {
        setTimeout(() => {
            this.input.selectionStart = this.input.selectionEnd = this.input.value.length;
        }, 0);
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            document.querySelector('.time').textContent = timeString;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    showNotification(message) {
        const notification = document.querySelector('.notification');
        notification.innerHTML = `
            <span class="material-icons">info</span>
            ${message}
        `;
        notification.style.display = 'block';
        
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        this.notificationTimeout = setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    clear() {
        const inputLine = this.terminal.lastElementChild;
        this.terminal.innerHTML = '';
        this.terminal.appendChild(inputLine);
    }

    handleClose() {
        document.body.innerHTML = `
            <div style="color: white; padding: 20px; text-align: center;">
                <span class="material-icons" style="font-size: 48px;">power_settings_new</span>
                <p>Terminal session ended.</p>
            </div>
        `;
    }

    handleMaximize() {
        const terminalWindow = document.querySelector('.terminal-window');
        if (!document.fullscreenElement) {
            terminalWindow.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    handleMinimize() {
        const terminalWindow = document.querySelector('.terminal-window');
        terminalWindow.style.transform = 'scale(0.8)';
        terminalWindow.style.opacity = '0.8';
        setTimeout(() => {
            terminalWindow.style.transform = '';
            terminalWindow.style.opacity =// Terminal Class Definition
class Terminal {
    constructor() {
        // DOM Elements
        this.terminal = document.getElementById('terminal');
        this.input = document.querySelector('.input-field');
        
        // State Management
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.isProcessing = false;
        
        // Command Configuration
        this.commandAliases = {
            'ls': 'help',
            'hi': 'about',
            '?': 'help',
            'cls': 'clear'
        };

        // Portfolio Content
        this.portfolioContent = {
            about: {
                title: 'About Me',
                icon: 'person',
                content: `I'm a Database Administrator with over 5 years of experience in designing, implementing, and maintaining enterprise-level database systems. Specializing in Oracle and SQL Server, I focus on performance optimization, high availability, and security.`
            },
            skills: {
                title: 'Technical Skills',
                icon: 'lightbulb',
                content: [
                    'â€¢ Database Management: Oracle, SQL Server, PostgreSQL',
                    'â€¢ Performance Tuning: Query optimization, indexing strategies',
                    'â€¢ High Availability: RAC, Always On, replication',
                    'â€¢ Backup & Recovery: RMAN, SQL backup, point-in-time recovery',
                    'â€¢ Scripting: Python, PowerShell, Bash',
                    'â€¢ Monitoring: OEM, SCOM, custom monitoring solutions'
                ]
            },
            projects: {
                title: 'Recent Projects',
                icon: 'folder',
                content: [
                    'â€¢ Database Migration Project - Led migration of 50TB database to cloud',
                    'â€¢ Performance Optimization - Improved query response time by 40%',
                    'â€¢ Automated Backup Solution - Developed custom backup verification system',
                    'â€¢ High Availability Setup - Implemented Always On AG for critical databases'
                ]
            },
            contact: {
                title: 'Contact Information',
                icon: 'email',
                content: [
                    'â€¢ Email: john.dba@example.com',
                    'â€¢ LinkedIn: linkedin.com/in/johndba',
                    'â€¢ GitHub: github.com/johndba'
                ]
            }
        };

        // Initialize
        this.setupListeners();
        this.setupClock();
        this.setupMenus();
    }

    // Event Listeners Setup
    setupListeners() {
        // Input handling
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Window controls
        document.querySelector('.close').addEventListener('click', () => this.handleClose());
        document.querySelector('.maximize').addEventListener('click', () => this.handleMaximize());
        document.querySelector('.minimize').addEventListener('click', () => this.handleMinimize());
        
        // Focus management
        this.input.addEventListener('blur', () => {
            if (!document.querySelector('.dropdown-menu.show')) {
                setTimeout(() => this.input.focus(), 10);
            }
        });

        // Prevent unwanted browser shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Backspace' && e.target === document.body) ||
                (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
            }
        });

        // Terminal click handling
        this.terminal.addEventListener('click', () => this.input.focus());

        // Keyboard accessibility for window controls
        document.querySelectorAll('.window-button').forEach(button => {
            button.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    // Menu System Setup
    setupMenus() {
        const panelLeft = document.querySelector('.panel-left');
        const menuStructure = [
            {
                id: 'activities',
                label: 'Activities',
                icon: 'apps',
                items: [
                    { icon: 'person', label: 'About Me', command: 'about' },
                    { icon: 'lightbulb', label: 'Skills', command: 'skills' },
                    { icon: 'folder', label: 'Projects', command: 'projects' },
                    { icon: 'email', label: 'Contact', command: 'contact' }
                ]
            },
            {
                id: 'applications',
                label: 'Applications',
                icon: 'grid_view',
                items: [
                    { icon: 'terminal', label: 'Terminal', command: 'clear' },
                    { icon: 'help', label: 'Help', command: 'help' }
                ]
            }
        ];

        menuStructure.forEach(menu => this.createMenu(menu, panelLeft));
        this.setupMenuHandlers();
    }

    // Menu Creation
    createMenu({ id, label, icon, items }, container) {
        const menuButton = document.createElement('div');
        menuButton.className = 'menu-button';
        menuButton.id = `${id}-button`;
        menuButton.setAttribute('role', 'button');
        menuButton.setAttribute('tabindex', '0');
        menuButton.setAttribute('aria-haspopup', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
        
        const menuHtml = `
            <span class="material-icons">${icon}</span>
            ${label}
            <div class="dropdown-menu" id="${id}-menu" role="menu">
                ${items.map(item => `
                    <div class="menu-item" 
                         role="menuitem" 
                         tabindex="0" 
                         data-command="${item.command}">
                        <span class="material-icons">${item.icon}</span>
                        ${item.label}
                    </div>
                `).join('')}
            </div>
        `;
        
        menuButton.innerHTML = menuHtml;
        container.appendChild(menuButton);
    }

    // Menu Event Handlers
    setupMenuHandlers() {
        const menus = document.querySelectorAll('.dropdown-menu');
        const overlay = document.querySelector('.overlay');
        const menuButtons = document.querySelectorAll('.menu-button');

        const closeMenus = () => {
            menus.forEach(menu => menu.classList.remove('show'));
            overlay.classList.remove('show');
            menuButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
        };

        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const menu = button.querySelector('.dropdown-menu');
                const isOpen = menu.classList.contains('show');
                
                closeMenus();
                
                if (!isOpen) {
                    menu.classList.add('show');
                    overlay.classList.add('show');
                    button.setAttribute('aria-expanded', 'true');
                }
            });

            // Keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });

        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const command = item.dataset.command;
                this.executeCommand(command);
                closeMenus();
            });

            // Keyboard accessibility
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });

        document.addEventListener('click', closeMenus);
        overlay.addEventListener('click', closeMenus);
    }

    // Input Handling
    handleInput(e) {
        if (this.isProcessing) return;

        switch (e.key) {
            case 'Enter':
                this.handleEnter(e);
                break;
            case 'ArrowUp':
                this.handleArrowUp(e);
                break;
            case 'ArrowDown':
                this.handleArrowDown(e);
                break;
            case 'Tab':
                this.handleTab(e);
                break;
            case 'c':
                if (e.ctrlKey) this.handleCtrlC();
                break;
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.clear();
                }
                break;
        }
    }

    handleEnter(e) {
        e.preventDefault();
        const command = this.input.value.trim().toLowerCase();
        
        if (command) {
            if (this.history.length >= this.maxHistorySize) {
                this.history.shift();
            }
            this.history.push(command);
            this.historyIndex = this.history.length;
            
            const actualCommand = this.commandAliases[command] || command;
            this.executeCommand(actualCommand);
        }
        
        this.input.value = '';
    }

    handleArrowUp(e) {
        e.preventDefault();
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.input.value = this.history[this.historyIndex];
            this.moveCursorToEnd();
        }
    }

    handleArrowDown(e) {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.input.value = this.history[this.historyIndex];
        } else {
            this.historyIndex = this.history.length;
            this.input.value = '';
        }
    }

    handleTab(e) {
        e.preventDefault();
        const input = this.input.value.toLowerCase();
        const commands = ['help', 'about', 'skills', 'projects', 'contact', 'clear', 'exit'];
        const matches = commands.filter(cmd => cmd.startsWith(input));

        if (matches.length === 1) {
            this.input.value = matches[0];
            this.moveCursorToEnd();
        } else if (matches.length > 1) {
            this.addLine(`Available commands: ${matches.join(', ')}`);
        }
    }

    handleCtrlC() {
        this.addLine(`<span class="prompt">john@portfolio:~$</span> ${this.input.value}`);
        this.addLine('^C');
        this.input.value = '';
    }

    // Command Execution
    async executeCommand(command) {
        try {
            this.isProcessing = true;
            this.addLine(`<span class="prompt">john@portfolio:~$</span> <span class="command-history">${command}</span>`);

            const commands = {
                help: () => this.showHelp(),
                about: () => this.showContent('about'),
                skills: () => this.showContent('skills'),
                projects: () => this.showContent('projects'),
                contact: () => this.showContent('contact'),
                clear: () => this.clear(),
                exit: () => this.handleClose()
            };

            if (commands[command]) {
                await commands[command]();
                this.showNotification(`Command executed: ${command}`);
            } else {
                this.addLine(`<span class="error">Command not found: ${command}. Type 'help' for available commands.</span>`);
            }
        } catch (error) {
            console.error('Command execution error:', error);
            this.addLine(`<span class="error">An error occurred while executing the command.</span>`);
        } finally {
            this.isProcessing = false;
            this.terminal.scrollTop = this.terminal.scrollHeight;
        }
    }

    // Content Display
    showContent(type) {
        const content = this.portfolioContent[type];
        const card = `
            <div class="content-card">
                <h3><span class="material-icons">${content.icon}</span>${content.title}</h3>
                ${Array.isArray(content.content) 
                    ? content.content.join('\n') 
                    : content.content}
            </div>
        `;
        this.addLine(card);
    }

    showHelp() {
        const help = `
            <div class="content-card">
                <h3><span class="material-icons">help</span>Available Commands</h3>
                â€¢ help     - Show this help menu
                â€¢ about    - Display information about me
                â€¢ skills   - List my technical skills
                â€¢ projects - View my recent projects
                â€¢ contact  - Get my contact information
                â€¢ clear    - Clear the terminal (Ctrl+L)
                â€¢ exit     - Close the terminal

                Keyboard Shortcuts:
                â€¢ Up/Down  - Navigate command history
                â€¢ Tab      - Auto-complete commands
                â€¢ Ctrl+C   - Cancel current command
                â€¢ Ctrl+L   - Clear terminal
            </div>
        `;
        this.addLine(help);
    }

    // Helper Methods
    addLine(content) {
        const line = document.createElement('div');
        line.className = 'line';
        line.innerHTML = content;
        this.terminal.insertBefore(line, this.terminal.lastElementChild);
    }

    moveCursorToEnd() {
        setTimeout(() => {
            this.input.selectionStart = this.input.selectionEnd = this.input.value.length;
        }, 0);
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            document.querySelector('.time').textContent = timeString;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    showNotification(message) {
        const notification = document.querySelector('.notification');
        notification.innerHTML = `
            <span class="material-icons">info</span>
            ${message}
        `;
        notification.style.display = 'block';
        
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        this.notificationTimeout = setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    clear() {
        const inputLine = this.terminal.lastElementChild;
        this.terminal.innerHTML = '';
        this.terminal.appendChild(inputLine);
    }

    handleClose() {
        document.body.innerHTML = `
            <div style="color: white; padding: 20px; text-align: center;">
                <span class="material-icons" style="font-size: 48px;">power_settings_new</span>
                <p>Terminal session ended.</p>
            </div>
        `;
    }

    handleMaximize() {
        const terminalWindow = document.querySelector('.terminal-window');
        if (!document.fullscreenElement) {
            terminalWindow.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    handleMinimize() {
        const terminalWindow = document.querySelector('.terminal-window');
        terminalWindow.style.transform = 'scale(0.8)';
        terminalWindow.style.opacity = '0.8';
        setTimeout(() => {
            terminalWindow.style.transform = '';
            terminalWindow.style.opacity = '1';
        }, 300);
    }
}

// Utility Functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.terminal = new Terminal();
    } catch (error) {
        console.error('Failed to initialize terminal:', error);
        document.body.innerHTML = `
            <div style="color: white; padding: 20px; text-align: center;">
                <span class="material-icons" style="font-size: 48px;">error</span>
                <p>Failed to initialize terminal. Please refresh the page.</p>
            </div>
        `;
    }
});

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    const terminal = window.terminal;
    if (terminal) {
        terminal.addLine(`<span class="error">An error occurred: ${escapeHtml(event.error.message)}</span>`);
        terminal.isProcessing = false;
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    const terminal = window.terminal;
    if (terminal) {
        terminal.addLine(`<span class="error">An error occurred: ${escapeHtml(event.reason.message)}</span>`);
        terminal.isProcessing = false;
    }
});

// Service Worker Registration (optional, for PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}
