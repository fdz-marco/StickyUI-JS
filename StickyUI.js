/*
/* ------------------------------------------------------------------------------
/* ClassName: Sticky UI JS
/* Description: A simple class to create user interfaces over the browser DOM
/* specially useful for canvas-based applications or HMIs.
/* Author: Marco Fernandez (marcofdz.com)
/* Version: 1.0.2
/* License: MIT
/* Repository: https://github.com/fdz-marco/StickyUI-JS
/* File: StickyUI.js
/* ------------------------------------------------------------------------------
*/

class StickyUI {
    #classBase = 'stickyUI';

    // ----------------------------------------
    // Constructor
    // ----------------------------------------

    constructor() {
        // Inject styles to the head (Not used, prefer to use the css file)
        //this.addStyles();

        // Init the theme according to the system preferences
        this.applyStoredTheme();
    }

    // ----------------------------------------
    // Aliases
    // ----------------------------------------

    // Alias for appendChild
    add = (content) => {
        if (content !== null && typeof content === 'string') {
            document.body.innerHTML = content;
        }
        else if (content !== null && typeof content === 'object') {
            if (content instanceof Array) {
                content.forEach(item => {
                    document.body.appendChild(item);
                });
            } else {
                document.body.appendChild(content);
            }
        }
    }

    // Alias for removeChild
    remove = (content) => {
        if (content !== null && typeof content === 'object') {
            if (content instanceof Array) {
                content.forEach(item => {
                    document.body.removeChild(item);
                });
            } else {
                document.body.removeChild(content);
            }
        }
    }

    // ----------------------------------------
    // Theme
    // ----------------------------------------

    // Switch theme
    switchTheme = (theme = null) => {
        // If no theme is provided, toggle between the themes
        if (theme === null) {
            theme = this._theme === 'dark' ? 'light' : 'dark';
        }
        
        // Validate the theme
        if (theme !== 'dark' && theme !== 'light') {
            console.error('Invalid theme. Use "dark" or "light".');
            return;
        }
        
        // Save the current theme
        this._theme = theme;
        
        // Apply the theme to the document
        document.documentElement.setAttribute('data-theme', theme);
        console.log('Theme applied:', theme);
        
        // Create and send a theme change event
        const event = new CustomEvent('theme-change', {
            detail: { theme: theme }
        });
        document.dispatchEvent(event);
        
        // Save preference in localStorage to keep it between sessions
        try {
            localStorage.setItem('stickyui-theme', theme);
        } catch (e) {
            console.warn('Could not save theme in localStorage.');
        }
        
        return theme;
    }

    // Get the current theme
    getTheme = () => {
        return this._theme;
    }

    // Apply the stored theme
    applyStoredTheme = () => {
        let storedTheme = null;
        
        // Try to recover the saved theme
        try {
            storedTheme = localStorage.getItem('stickyui-theme');
        } catch (e) {
            console.warn('Could not recover theme from localStorage.');
        }
        
        // If there is a saved theme, apply it
        if (storedTheme) {
            this.switchTheme(storedTheme);
        } else {
            // If there is no saved theme, use the system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.switchTheme(prefersDark ? 'dark' : 'light');
        }
    }

    // ----------------------------------------
    // Basic methods
    // ----------------------------------------
    
    // Create an element 
    element = (type, id = null, className = null, content = null) => {
        // Create the element
        let element = document.createElement(type);
        if (id !== null) 
            element.id = id;
        // Methods: Alias for appendChild, addEventListener, removeEventListener, addClass, removeClass
        element.addContent = (content) => {
            if (content !== null && typeof content === 'string') {
                element.innerHTML = content;
            }
            else if (content !== null && typeof content === 'object') {
                if (content instanceof Array) {
                    content.forEach(item => {
                        element.appendChild(item);
                    });
                } else {
                    element.appendChild(content);
                }
            }
        };
        element.addEvent = (event, callback) => {
            element.addEventListener(event, callback);
        };
        element.removeEvent = (event, callback) => {
            element.removeEventListener(event, callback);
        };
        element.addClass = (className) => {
            if (className !== null) {
                if(typeof className === 'string') 
                    className.split(" ").forEach(name => { element.classList.add(name); });
                if(className instanceof Array) 
                    className.forEach(name => { element.classList.add(name); });
            }  
        };
        element.removeClass = (className) => {
            if (className !== null) {
                if(typeof className === 'string') 
                    className.split(" ").forEach(name => { element.classList.remove(name); });
                if(className instanceof Array) 
                    className.forEach(name => { element.classList.remove(name); });
            }
        };
        element.toggleClass = (className) => {
            if (className !== null) {
                if(typeof className === 'string') 
                    element.classList.toggle(className);
                if(className instanceof Array) 
                    className.forEach(name => { element.classList.toggle(name); });
            }
        };
        element.hasClass = (className) => {
            if (className !== null) {
                if(typeof className === 'string') 
                    return element.classList.contains(className);
                if(className instanceof Array) 
                    return className.some(name => element.classList.contains(name));
            }   
        };
        // Add the class and content (Invoked after methods)
        element.addClass(this.#classBase);
        element.addClass(className);
        element.addContent(content);
        return element;
    }

    // Generate a random UID (to avoid duplicate IDs)
    UID = (length = 5) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() *  chars.length));
        }
        return result;
    }

    // ----------------------------------------
    // Single Icon
    // ----------------------------------------

    icon = (iconName = null) => {
        const UID = this.UID();
        let _currentIcon = iconName;
        const iconElement = this.element('div',`icon_${UID}`, 'icon');
        if (iconName)
            iconElement.addClass(iconName)

        iconElement.changeIcon = (iconName) => {
            iconElement.removeClass(_currentIcon);
            iconElement.addClass(iconName);
            _currentIcon = iconName;
        }

        return iconElement;
    }

    // ----------------------------------------
    // Menu Bar
    // ----------------------------------------
 
    menuBarItem = (labelText = null, icon = null, contextMenu = null) => {
        const UID = this.UID();
        const menuBarItem = this.element('div', `menuBarItem_${UID}`, 'menuBarItem');
        const menuBarItemLabel = this.element('div', `menuBarItemLabel_${UID}`, 'menuBarItemLabel', labelText);
        menuBarItem.addContent(menuBarItemLabel);

        if (icon) {
            const menuBarItemIconContainer = this.element('div', `menuBarItemIconContainer_${UID}`, 'menuBarItemIconContainer');
            const menuBarItemIcon = this.icon(icon);
            menuBarItemIconContainer.addContent(menuBarItemIcon);
            menuBarItem.addContent(menuBarItemIconContainer);
        }

        if (contextMenu) {
            menuBarItem.addEvent('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const activeContextMenu = document.querySelector(`.${this.#classBase}.contextMenu.show`);
                if (activeContextMenu) {
                    activeContextMenu.hideContextMenu();
                }
                const rect = menuBarItem.getBoundingClientRect();
                const parentMenuBar = menuBarItem.closest('.menuBar').getBoundingClientRect();
                const x = parseFloat(rect.left);
                const y = parseFloat(parentMenuBar.height);
                contextMenu.showContextMenu(x, y);
            });
            document.body.appendChild(contextMenu);
        }
        
        return menuBarItem;
    }

    menuBar = (menuBarItems) => {
        const UID = this.UID();
        const menuBar = this.element('div', `menuBar_${UID}`, 'menuBar');
        if (menuBarItems !== null && menuBarItems instanceof Array) 
            menuBar.addContent(menuBarItems);

        // Hide context menu when clicking outside
        document.addEventListener('click', () => {
            const activeContextMenu = document.querySelector(`.${this.#classBase}.contextMenu.show`);
            if (activeContextMenu) {
                activeContextMenu.hideContextMenu();
            }
        });

        return menuBar;
    }

    // ----------------------------------------
    // Context Menu
    // ----------------------------------------

    contextMenuItem = (labelText = null, icon = null, onClick = null, closeOnClick = true) => {
        const UID = this.UID();
        const contextMenuItem = this.element('div', `contextMenuItem_${UID}`, 'contextMenuItem');
        const contextMenuItemLabel = this.element('div', `contextMenuItemLabel_${UID}`, 'contextMenuItemLabel', labelText);
        
        if (icon) {
            const contextMenuItemIconContainer = this.element('div', `contextMenuItemIconContainer_${UID}`, 'contextMenuItemIconContainer');
            const contextMenuItemIcon = this.icon(icon);
            contextMenuItemIconContainer.addContent(contextMenuItemIcon);
            contextMenuItem.addContent(contextMenuItemIconContainer);
        }
        
        contextMenuItem.addContent(contextMenuItemLabel);

        if (onClick) {
            contextMenuItem.onClick = onClick;
            contextMenuItem.addEvent('click', (e) => {
                e.stopPropagation();
                contextMenuItem.onClick();
                if (closeOnClick) 
                    contextMenuItem.closest(".contextMenu").hideContextMenu();
            });
        }
        
        return contextMenuItem;
    }

    contextMenu = (contextMenuItems) => {
        const UID = this.UID();
        const contextMenu = this.element('div', `contextMenu_${this.UID()}`, 'contextMenu');
        if (contextMenuItems !== null && contextMenuItems instanceof Array) 
            contextMenu.addContent(contextMenuItems);

        // Methods to show and hide the context menu externally
        contextMenu.showContextMenu = (x, y, preferredDirection = 'right-bottom') => {
            // Make the menu visible temporarily outside of the viewport to measure
            contextMenu.style.visibility = 'hidden';
            contextMenu.style.display = 'block';
            contextMenu.style.position = 'fixed';
            contextMenu.style.top = '-9999px';
            contextMenu.style.left = '-9999px';
            // Add the menu to the DOM if it's not already there
            const isInDOM = document.body.contains(contextMenu);
            if (!isInDOM) {
                document.body.appendChild(contextMenu);
            }
            // Get the actual dimensions of the menu
            const rect = contextMenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const padding = 0;
            // Calculate available space in each direction
            const spaceRight = viewportWidth - x;
            const spaceLeft = x;
            const spaceBottom = viewportHeight - y;
            const spaceTop = y;
            // Determine best position based on available space
            let finalX = x;
            let finalY = y;
            let direction = preferredDirection;

            // Check horizontal space
            if (direction.includes('right') && spaceRight < rect.width + padding) {
                direction = direction.replace('right', 'left');
            } else if (direction.includes('left') && spaceLeft < rect.width + padding) {
                direction = direction.replace('left', 'right');
            }

            // Check vertical space
            if (direction.includes('bottom') && spaceBottom < rect.height + padding) {
                direction = direction.replace('bottom', 'top');
            } else if (direction.includes('top') && spaceTop < rect.height + padding) {
                direction = direction.replace('top', 'bottom');
            }

            // Apply position based on final direction
            switch (direction) {
                case 'right-bottom':
                    finalX = x;
                    finalY = y;
                    break;
                case 'right-top':
                    finalX = x;
                    finalY = y - rect.height;
                    break;
                case 'left-bottom':
                    finalX = x - rect.width;
                    finalY = y;
                    break;
                case 'left-top':
                    finalX = x - rect.width;
                    finalY = y - rect.height;
                    break;
            }

            // Ensure menu stays within viewport bounds
            finalX = Math.max(padding, Math.min(finalX, viewportWidth - rect.width - padding));
            finalY = Math.max(padding, Math.min(finalY, viewportHeight - rect.height - padding));

            // Apply final position and show menu
            contextMenu.style.visibility = 'visible';
            contextMenu.style.left = `${finalX}px`;
            contextMenu.style.top = `${finalY}px`;
            contextMenu.addClass('show');
            contextMenu.setAttribute('data-direction', direction);
        }

        contextMenu.hideContextMenu = () => {
            contextMenu.removeClass('show');
            contextMenu.style.visibility = 'hidden';
        }

        return contextMenu;
    }

    // ----------------------------------------
    // Status Bar
    // ----------------------------------------
    
    statusBarItem = (text = '', icon = null) => {
        const UID = this.UID();
        const container = this.element('div', `statusBarItem_${UID}`, 'statusBarItem');
        
        if (icon) {
            const iconElement = this.icon(icon);
            container.addContent(iconElement);
        }
        
        if (text) {
            const textElement = this.element('span', `statusBarItemText_${UID}`, null, text);
            container.addContent(textElement);
        }
        
        return container;
    }

    statusBar = (statusBarItems) => {
        const UID = this.UID();
        const container = this.element('div', `statusBar_${UID}`, 'statusBar');
        if (statusBarItems !== null && statusBarItems instanceof Array) 
            container.addContent(statusBarItems);

        return container;
    }

    // ----------------------------------------
    // Tooltip
    // ----------------------------------------

    tooltip = (element, text, position = 'top') => {
        const UID = this.UID();
        const tooltip = this.element('div', `tooltip_${UID}`, 'tooltip', text);

        const showTooltip = (e) => {
            tooltip.addClass('show');
            
            // Calculate position
            const elementRect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let left, top;
            let preferredPosition = position;
            
            // Check available space
            const spaceTop = elementRect.top;
            const spaceBottom = window.innerHeight - elementRect.bottom;
            const spaceLeft = elementRect.left;
            const spaceRight = window.innerWidth - elementRect.right;
            
            // Adjust position based on available space
            if (preferredPosition === 'top' && spaceTop < tooltipRect.height) {
                preferredPosition = 'bottom';
            } else if (preferredPosition === 'bottom' && spaceBottom < tooltipRect.height) {
                preferredPosition = 'top';
            } else if (preferredPosition === 'left' && spaceLeft < tooltipRect.width) {
                preferredPosition = 'right';
            } else if (preferredPosition === 'right' && spaceRight < tooltipRect.width) {
                preferredPosition = 'left';
            }
            
            // Apply position
            switch (preferredPosition) {
                case 'top':
                    left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                    top = elementRect.top - tooltipRect.height - 8;
                    break;
                case 'bottom':
                    left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                    top = elementRect.bottom + 8;
                    break;
                case 'left':
                    left = elementRect.left - tooltipRect.width - 8;
                    top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                    break;
                case 'right':
                    left = elementRect.right + 8;
                    top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                    break;
            }
            
            // Ensure the tooltip does not go out of the window
            left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
            top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            
            // Update position class
            tooltip.addClass(`show ${preferredPosition}`);
        };

        const hideTooltip = () => {
            tooltip.removeClass('show');
        };

        element.addEvent('mouseenter', showTooltip);
        element.addEvent('mouseleave', hideTooltip);
        
        return tooltip;
    }

    // ----------------------------------------
    // Floating Panel
    // ----------------------------------------
     
    // Floating Panel Title Bar
    floatingPanelTitleBar = (titleText = 'Panel', floatingPanel = null, defaultOpen = true) => {
        const UID = this.UID();
        const titleBarContainer = this.element('div',`floatingPanelTitleBar_${UID}`, 'floatingPanelTitleBar');
        const titleBarTitle = this.element('div',`floatingPanelTitleBarTitle_${UID}`, 'floatingPanelTitleBarTitle', titleText);
        const btnMinimize = this.element('div',`floatingPanelTitleBarButton_${UID}`, 'floatingPanelTitleBarButton', this.icon('icon-minimize'));
        const btnMaximize = this.element('div',`floatingPanelTitleBarButton_${UID}`, 'floatingPanelTitleBarButton', this.icon('icon-maximize'));
        const btnScale = this.element('div',`floatingPanelTitleBarButton_${UID}`, 'floatingPanelTitleBarButton', this.icon('icon-scale'));
        const btnStack = this.element('div',`floatingPanelTitleBarButton_${UID}`, 'floatingPanelTitleBarButton', this.icon('icon-stack'));
        const btnClose = this.element('div',`floatingPanelTitleBarButton_${UID}`, 'floatingPanelTitleBarButton', this.icon('icon-close'));
        btnMaximize.style.display = 'none';
        
        // Scale Menu
        const menuScaleSlider = ui.sliderRange('', 75, 100, 1, 100);
        const menuScaleResetBtn = ui.button('Reset');
        const contextMenu = ui.contextMenu([menuScaleSlider, menuScaleResetBtn]);
        contextMenu.style.padding = '4px';

        // Set initial state
        if (!defaultOpen) {
            btnMinimize.style.display = 'none';
            btnMaximize.style.display = 'block';
            floatingPanel.addClass('minimized');
        }

        // Event listeners
        btnClose.addEvent('click', () => {
            floatingPanel.style.display = 'none';
        });

        btnMinimize.addEvent('click', () => {
            btnMinimize.style.display = 'none';
            btnMaximize.style.display = 'block';
            floatingPanel.addClass('minimized');
        });

        btnMaximize.addEvent('click', () => {
            btnMaximize.style.display = 'none';
            btnMinimize.style.display = 'block';
            floatingPanel.removeClass('minimized');
        });

        btnScale.addEvent('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = btnScale.getBoundingClientRect();
            const x = parseFloat(rect.left);
            const y = parseFloat(rect.top);
            contextMenu.showContextMenu(x, y, 'right-top');
        });

        menuScaleSlider.addEvent('input', () => {
            const scale = parseInt(menuScaleSlider.getValue()) / 100;
            floatingPanel.style.transform = `scale(${scale})`;
            floatingPanel.style.transformOrigin = 'top right';
        });

        menuScaleResetBtn.addEvent('click', () => {
            floatingPanel.style.transform = `scale(1)`;
        });

        titleBarContainer.addContent([titleBarTitle, btnMinimize, btnMaximize, btnScale, btnStack, btnClose]);
        return titleBarContainer;
    }

    // Floating Panel
    floatingPanel = (titleText = 'Panel', width = null, height = null, positionX = null, positionY = null, defaultOpen = true) => {
        const UID = this.UID();
        const floatingPanel = this.element('div',`floatingPanel_${UID}`, 'floatingPanel');
        const contentWrapper = this.element('div',`floatingPanelContentWrapper_${UID}`, 'floatingPanelContentWrapper');
        const titleBar = this.floatingPanelTitleBar(titleText, floatingPanel, defaultOpen);
        floatingPanel.addContent([titleBar, contentWrapper]);

        // Configurations
        if (width) {
            if (width === 'auto')
                floatingPanel.style.width = 'auto';
            else if (typeof width === 'number')
                floatingPanel.style.width = `${width}px`;
            else if (typeof width === 'string' && width.includes('%'))
                floatingPanel.style.width = width;
            else
                floatingPanel.style.width = 'auto';
        }
        if (height) {
            if (height === 'auto')
                floatingPanel.style.height = 'auto';
            else if (typeof height === 'number')
                floatingPanel.style.height = `${height}px`;
            else if (typeof height === 'string' && height.includes('%'))
                floatingPanel.style.height = height;
            else
                floatingPanel.style.height = 'auto';
        }
        if (positionX) {
            if (typeof positionX === 'number') {
                if (positionX > 0)
                    floatingPanel.style.left = `${positionX}px`;
                else
                    floatingPanel.style.right = `${positionX*-1}px`;
            }
            else if (typeof positionX === 'string' && positionX.includes('%'))
                floatingPanel.style.left = positionX;
            else
                floatingPanel.style.left = 'auto';
        }
        if (positionY) {
            if (typeof positionY === 'number') {
                if (positionY > 0)
                    floatingPanel.style.top = `${positionY}px`;
                else
                    floatingPanel.style.bottom = `${positionY*-1}px`;
            }
            else if (typeof positionY === 'string' && positionY.includes('%'))
                floatingPanel.style.top = positionY;
            else
                floatingPanel.style.top = 'auto';
        }
        // Overwrite addContent method
        // To allow add content from external sources in the contentWrapper directly
        floatingPanel.addContent = (content) => {
            contentWrapper.addContent(content);
        }

        // Add Drag and Resize
        this.setDraggable(floatingPanel, titleBar);
        this.setResizable(floatingPanel);

        return floatingPanel;
    }

    // ----------------------------------------
    // Toolbar
    // ----------------------------------------

    // Get the top offset of the toolbars, if toolbar is given, calculate the offset relative to it 
    // Handle multiple toolbars at top (stack them)
    __getToolbarTopOffset = (relativeTo = null) => {
        let topOffset = 0;
        // Add the offset of the menuBar if it exists
        const menuBar = document.querySelector(`.${this.#classBase}.menuBar`);
        if (menuBar)
            topOffset += menuBar.offsetHeight;
        // Add the offset of the toolbars at top
        const topToolbars = document.querySelectorAll(`.${this.#classBase}.toolbar.toolbar-top`);
        if (topToolbars.length > 0) {
            // If no relativeTo is given, add the height of all top toolbars    
            if (relativeTo === null) {
                topOffset += Array.from(topToolbars).reduce((height, _toolbar) => { return height + _toolbar.offsetHeight; }, 0);
            }
            // If a relativeTo is given, add the height of the top toolbars until the relativeTo toolbar
            else {
                const index = Array.from(topToolbars).indexOf(relativeTo);
                const previousToolbars = Array.from(topToolbars).slice(0, index);
                topOffset += previousToolbars.reduce((height, _toolbar) => { return height + _toolbar.offsetHeight; }, 0);
            }
        }
        return topOffset;
    }

    // Get the bottom offset of the toolbars, if toolbar is given, calculate the offset relative to it 
    // Handle multiple toolbars at bottom (stack them)
    __getToolbarBottomOffset = (relativeTo = null) => {
        let bottomOffset = 0;
        // Add the offset of the statusBar if it exists
        const statusBar = document.querySelector(`.${this.#classBase}.statusBar`);
        if (statusBar)
            bottomOffset += statusBar.offsetHeight;        
        // Add the offset of the toolbars at bottom
        const bottomToolbars = document.querySelectorAll(`.${this.#classBase}.toolbar.toolbar-bottom`);
        if (bottomToolbars.length > 0) {
            // If no relativeTo is given, add the height of all bottom toolbars
            if (relativeTo === null) {
                bottomOffset += Array.from(bottomToolbars).reduce((height, _toolbar) => { return height + _toolbar.offsetHeight; }, 0);
            }
            // If a relativeTo is given, add the height of the bottom toolbars until the relativeTo toolbar
            else {
                const index = Array.from(bottomToolbars).indexOf(relativeTo);
                const previousToolbars = Array.from(bottomToolbars).slice(0, index);
                bottomOffset += previousToolbars.reduce((height, _toolbar) => { return height + _toolbar.offsetHeight; }, 0);
            }
        }
        return bottomOffset;
    }

    // Get the left offset of the toolbars, if toolbar is given, calculate the offset relative to it 
    // Handle multiple toolbars at left (stack them)
    __getToolbarLeftOffset = (relativeTo = null) => {
        let leftOffset = 0;
        // Add the offset of the toolbars at left
        const leftToolbars = document.querySelectorAll(`.${this.#classBase}.toolbar.toolbar-left`);
        if (leftToolbars.length > 0) {
            // If no relativeTo is given, add the width of all left toolbars
            if (relativeTo === null) {
                leftOffset = Array.from(leftToolbars).reduce((width, _toolbar) => { return width + _toolbar.offsetWidth; }, 0);
            }
            // If a relativeTo is given, add the width of the left toolbars until the relativeTo toolbar
            else {
                const index = Array.from(leftToolbars).indexOf(relativeTo);
                const previousToolbars = Array.from(leftToolbars).slice(0, index);
                leftOffset = previousToolbars.reduce((width, _toolbar) => { return width + _toolbar.offsetWidth; }, 0);
            }
        }
        return leftOffset;
    }

    // Get the right offset of the toolbars, if toolbar is given, calculate the offset relative to it 
    // Handle multiple toolbars at right (stack them)
    __getToolbarRightOffset = (relativeTo = null) => {
        let rightOffset = 0;
        // Add the offset of the toolbars at right
        const rightToolbars = document.querySelectorAll(`.${this.#classBase}.toolbar.toolbar-right`);
        if (rightToolbars.length > 0) {
            // If no relativeTo is given, add the width of all right toolbars
            if (relativeTo === null) {
                rightOffset = Array.from(rightToolbars).reduce((width, _toolbar) => { return width + _toolbar.offsetWidth; }, 0);   
            }
            // If a relativeTo is given, add the width of the right toolbars until the relativeTo toolbar
            else {
                const index = Array.from(rightToolbars).indexOf(relativeTo);
                const previousToolbars = Array.from(rightToolbars).slice(0, index);
                rightOffset = previousToolbars.reduce((width, _toolbar) => { return width + _toolbar.offsetWidth; }, 0);
            }
        }
        return rightOffset;
    }

    // Update position of all toolbars
    __updatePositionToolbars = () => {
        const toolbars = document.querySelectorAll(`.${this.#classBase}.toolbar`);
        toolbars.forEach(toolbar => toolbar.updatePosition());
    }

    toolbar = (position = 'top', toolbarItems = null) => {
        const UID = this.UID();
        const toolbar = this.element('div', `toolbar_${UID}`, 'toolbar');
        toolbar.addClass(`toolbar-${position}`);
        if (toolbarItems)
            toolbar.addContent(toolbarItems);
        
        // Update the position of the toolbar
        toolbar.updatePosition = () => {
            // Get the offsets and adjust the position of the toolbar
            if (position === 'top' || position === 'bottom') {
                toolbar.style.left = `0px`;
                if (position === 'top') {
                    // Get absolute position under menuBar and other top toolbars if they exist
                    let topOffset = this.__getToolbarTopOffset(toolbar); 
                    toolbar.style.top = `${topOffset}px`;
                }
                else if (position === 'bottom') {
                    // Get absolute position over statusBar and other bottom toolbars if they exist
                    let bottomOffset = this.__getToolbarBottomOffset(toolbar); 
                    toolbar.style.bottom = `${bottomOffset}px`;
                }
            }
            else if (position === 'left' || position === 'right') {
                // Get absolute position under menuBar and ALL top toolbars if they exist
                let topOffset = this.__getToolbarTopOffset(); 
                // Get absolute position over statusBar and ALL bottom toolbars if they exist
                let bottomOffset = this.__getToolbarBottomOffset(); 
                // Adjust the height and vertical position of the toolbar
                toolbar.style.top = `${topOffset}px`;
                toolbar.style.height = `calc(100% - ${topOffset + bottomOffset}px)`;
                // Adjust the horizontal position of the toolbar
                if (position === 'left') {
                    // Get absolute position to the left of other left toolbars if they exist
                    let leftOffset = this.__getToolbarLeftOffset(toolbar); 
                    toolbar.style.left = `${leftOffset}px`;
                }
                else if (position === 'right') {
                    // Get absolute position to the right of other right toolbars if they exist
                    let rightOffset = this.__getToolbarRightOffset(toolbar); 
                    toolbar.style.right = `${rightOffset}px`;
                }
            }
        }
        requestAnimationFrame(toolbar.updatePosition);

        // Update the position of toolbars when the window is resized
        window.addEventListener('resize', this.__updatePositionToolbars);

        // Toggle the toolbar
        toolbar.toggle = (visible = null) => {         
            // Check if the toolbar is hidden
            const show = (visible === null) ? toolbar.hasClass('toolbar-hidden') : visible;
            // Show or hide the toolbar
            if (show) {
                toolbar.removeClass('toolbar-hidden');
            }
            else {
                toolbar.addClass('toolbar-hidden');
            }
            requestAnimationFrame(this.__updatePositionToolbars);
            requestAnimationFrame(this.__updatePositionSidePanels);
            requestAnimationFrame(this.__updatePositionWorkspace);
        };
        
        // Show the toolbar
        toolbar.show = () => {
            return toolbar.toggle(true);
        };
        
        // Hide the toolbar
        toolbar.hide = () => {
            return toolbar.toggle(false);
        };

        return toolbar;
    }


    toolbarButton = (icon = null, onClick = null, tooltipText = null) => {
        const UID = this.UID();
        const button = this.element('div', `toolbarButton_${UID}`, 'toolbarButton');
        
        if (icon) {
            const iconElement = this.icon(icon);
            button.appendChild(iconElement);
        }
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        if (tooltipText) {
            const tooltipTop = this.tooltip(button, tooltipText, 'top');
            document.body.appendChild(tooltipTop);
        }
        
        return button;
    }

    toolbarDivider = () => {
        const UID = this.UID();
        return this.element('div', `toolbarDivider_${UID}`, 'toolbarDivider');
    }

    // ----------------------------------------
    // Side Panel
    // ----------------------------------------

    // Update position of all side panels
    __updatePositionSidePanels = () => {
        const sidePanels = document.querySelectorAll(`.${this.#classBase}.sidePanel`);
        sidePanels.forEach(sidePanel => sidePanel.updatePosition());
    }

    sidePanelSectionTitleBar = (titleText = 'Section', sidePanelSection = null, defaultOpen = true) => {
        const UID = this.UID();
        const titleBarContainer = this.element('div',`sidePanelSectionTitleBar_${UID}`, 'sidePanelSectionTitleBar');
        const titleBarTitle = this.element('div',`sidePanelSectionTitleBarTitle_${UID}`, 'sidePanelSectionTitleBarTitle', titleText);
        const iconMinimize = this.icon('icon-chevron-up');
        const btnMinimize = this.element('div',`sidePanelSectionTitleBarButton_${UID}`, 'sidePanelSectionTitleBarButton', iconMinimize);
        
        // Set initial state
        if (!defaultOpen) {
            sidePanelSection.addClass('minimized');
            iconMinimize.changeIcon('icon-chevron-down');
        }

         // Event listeners
        btnMinimize.addEvent('click', () => {
            sidePanelSection.toggleClass('minimized');
            if (sidePanelSection.hasClass('minimized'))
                iconMinimize.changeIcon('icon-chevron-down');
            else
                iconMinimize.changeIcon('icon-chevron-up');
        });

        titleBarContainer.addContent([titleBarTitle, btnMinimize]);
        return titleBarContainer;
    }

    sidePanelSection = (titleText = 'Section', sidePanelItems = null, defaultOpen = true) => {
        const UID = this.UID();
        const sidePanelSection = this.element('div', `sidePanelSection_${UID}`, 'sidePanelSection');
        const titleBar = this.sidePanelSectionTitleBar(titleText, sidePanelSection, defaultOpen);
        const contentWrapper = this.element('div', `sidePanelSectionContentWrapper_${UID}`, 'sidePanelSectionContentWrapper');
        
        sidePanelSection.addContent([titleBar, contentWrapper]);
        
        if (sidePanelItems !== null) 
            contentWrapper.addContent(sidePanelItems);
        
        return sidePanelSection;
    }

    sidePanel = (position = 'left', width = '280px') => {
        const UID = this.UID();
        const sidePanel = this.element('div', `sidePanel_${UID}`, 'sidePanel');
        sidePanel.addClass(`sidePanel-${position}`);
        sidePanel.style.width = width;
        // Save the original width to restore it later (when hiding the sidePanel)
        sidePanel._width = width; 
        
        // Update the position of the sidePanel
        sidePanel.updatePosition = () => {
            // Get the offsets and adjust the position of the sidePanel
            let topOffset = this.__getToolbarTopOffset();
            let bottomOffset = this.__getToolbarBottomOffset();
            // Adjust the height and vertical position of the sidePanel
            sidePanel.style.top = `${topOffset}px`;
            sidePanel.style.height = `calc(100% - ${topOffset + bottomOffset}px)`;
            // Adjust the horizontal position of the sidePanel
            if (position === 'left') {
                const leftOffset = this.__getToolbarLeftOffset();
                sidePanel.style.left = `${leftOffset}px`;
            } else if (position === 'right') {
                const rightOffset = this.__getToolbarRightOffset();
                sidePanel.style.right = `${rightOffset}px`;
            }
        };
        requestAnimationFrame(sidePanel.updatePosition);

        // Update the position of side panels when the window is resized
        window.addEventListener('resize', this.__updatePositionSidePanels);

        // Toggle the sidePanel
        sidePanel.toggle = (visible = null) => {         
            // Check if the sidePanel is hidden
            const show = (visible === null) ? sidePanel.hasClass('sidePanel-hidden') : visible;
            // Show or hide the sidePanel
            if (show) {
                // Show the sidePanel
                sidePanel.style.width = sidePanel._width;
                sidePanel.removeClass('sidePanel-hidden');
                // Adjust related elements
                if (position === 'left') {
                    let leftOffset = this.__getToolbarLeftOffset();
                    sidePanel.style.left = `${leftOffset}px`;
                } else if (position === 'right') {
                    let rightOffset = this.__getToolbarRightOffset();
                    sidePanel.style.right = `${rightOffset}px`;     
                }
            } else {
                // Hide the sidePanel
                sidePanel._width = sidePanel.style.width; // Save the current width
                sidePanel.addClass('sidePanel-hidden');
                sidePanel.style.width = '0px';
                sidePanel.style.overflow = 'hidden';
            }
            requestAnimationFrame(this.__updatePositionToolbars);
            requestAnimationFrame(this.__updatePositionSidePanels);
            requestAnimationFrame(this.__updatePositionWorkspace);
        };
        
        // Show the sidePanel
        sidePanel.show = () => {
            return sidePanel.toggle(true);
        };
        
        // Hide the sidePanel
        sidePanel.hide = () => {
            return sidePanel.toggle(false);
        };

        sidePanel.getWidth = () => {
            return sidePanel._width;
        }

        // Add section to sidePanel from external sources
        sidePanel.addSection = (titleText, sidePanelItems, defaultOpen = true) => {
            const section = this.sidePanelSection(titleText, sidePanelItems, defaultOpen);
            sidePanel.addContent(section);
            return section;
        };

        return sidePanel;
    }

    // ----------------------------------------
    // Workspace
    // ----------------------------------------

    // Update position of the workspace
    __updatePositionWorkspace = () => {
        const workspace = document.querySelector(`.${this.#classBase}.workspace`);
        workspace.updatePosition();
    }

    // Workspace
    workspace = (content = null, backgroundColor = null, backgroundImage = null) => {
        const UID = this.UID();
        const workspace = this.element('div', `workspace_${UID}`, 'workspace');
        let _workspaceWidth = 0;
        let _workspaceHeight = 0;
        let _canvas = null;
        
        if (content) 
            workspace.addContent(content);
        
        if (backgroundColor)
            workspace.style.backgroundColor = backgroundColor;
            
        if (backgroundImage)
            workspace.style.backgroundImage = `url("${backgroundImage}")`;
        
        // Update the position of the workspace
        workspace.updatePosition = () => {
             // Get the offsets of the toolbars
             let topOffset = this.__getToolbarTopOffset();
             let bottomOffset = this.__getToolbarBottomOffset();
             let leftOffset = this.__getToolbarLeftOffset();
             let rightOffset = this.__getToolbarRightOffset();
             // Get the offsets of the side panels
             const leftSidePanel = document.querySelector(`.${this.#classBase}.sidePanel.sidePanel-left:not(.sidePanel-hidden)`);
             const rightSidePanel = document.querySelector(`.${this.#classBase}.sidePanel.sidePanel-right:not(.sidePanel-hidden)`);
             if (leftSidePanel) {
                 //leftOffset += leftSidePanel.offsetWidth;
                 leftOffset += parseInt(leftSidePanel.getWidth());
             }
             if (rightSidePanel) {  
                 //rightOffset += rightSidePanel.offsetWidth;
                 rightOffset += parseInt(rightSidePanel.getWidth());
             }
            // Adjust the workspace height and vertical position
            workspace.style.top = `${topOffset}px`;
            workspace.style.bottom = `${bottomOffset}px`;
            workspace.style.height = `calc(100% - ${topOffset + bottomOffset}px)`;
            _workspaceHeight =  (document.documentElement.clientHeight - topOffset - bottomOffset);
            // Adjust the workspace width and horizontal position
            workspace.style.left = `${leftOffset}px`;
            workspace.style.right = `${rightOffset}px`;
            workspace.style.width = `calc(100% - ${leftOffset + rightOffset}px)`; 
            _workspaceWidth = (document.documentElement.clientWidth - leftOffset - rightOffset);
        }
        requestAnimationFrame(workspace.updatePosition);
        
        // Listen for changes in the size of the window
        window.addEventListener('resize', this.__updatePositionWorkspace);
      
        // Workspace set content
        workspace.setContent = (content) => {
            // Clear previous content
            while (workspace.firstChild) {
                workspace.removeChild(workspace.firstChild);
            }
            // Add new content
            workspace.addContent(content);
        }

        // Workspace set Canvas
        workspace.setCanvas = (autoResize = true) => {
            workspace.updatePosition();
            _canvas = document.createElement('canvas');
            _canvas.style.width ='100%';
            _canvas.style.height='100%';        
            _canvas.width = _workspaceWidth;
            _canvas.height = _workspaceHeight; 
            workspace.setContent(_canvas);
            if (autoResize) {
                window.addEventListener('resize', () => {
                    // Create a temporary canvas to store the original image
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    tempCtx.drawImage(canvas, 0, 0);

                    // Resize the canvas to the new dimensions
                    canvas.width  = workspace.getWidth();
                    canvas.height = workspace.getHeight(); 
                    // Restore the original image
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempCanvas, 0, 0);
                });
            }
            return _canvas;
        }
        
        workspace.getWidth = () => {
            const rect = workspace.getBoundingClientRect();
            return rect.width;
            //return workspace.offsetWidth;
        }

        workspace.getHeight = () => {
            const rect = workspace.getBoundingClientRect();
            return rect.height;
            //return workspace.offsetHeight;
        }






        return workspace;
    }

    // ----------------------------------------
    // Basic Controls
    // ----------------------------------------

    separator = (titleText = null, color = null) => {
        const UID = this.UID();
        const container = this.element('div', `separator_${UID}`, 'separator');
        
        if (titleText) {
            container.classList.add('separator-with-title');
            const titleSpan = this.element('span', `separatorTitle_${UID}`, 'separator-title', titleText);
            container.appendChild(titleSpan);
        }

        if (color)
            container.style.setProperty('--separator-color', color);
        
        return container;
    }

    button = (labelText = 'Button', bgColor = null, bgColorHover = null) => {
        const UID = this.UID();
        const container = this.element('div', `btn_${UID}`, 'button', labelText);
                
        if (bgColor)
            container.style.background = bgColor;

        if (bgColorHover) {
            container.addEventListener('mouseenter', () => {
                container.style.background = bgColorHover;
            });
            
            container.addEventListener('mouseleave', () => {
                container.style.background = bgColor || ''; 
            });
        }

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            container.addEventListener(eventType, functionCallback);
        }

        return container;
    }

    switch = (labelText = 'Switch', colorActive = null, colorInactive = null) => {
        const UID = this.UID();
        const container = this.element('div', `switchContainer_${UID}`, 'controlContainer');
        const label = this.element('div', `label_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper');
        const switchControl = this.element('label', `switchGroup_${UID}`, 'switchGroup');
        const switchInput = this.element('input', `switchInput_${UID}`, 'switchInput');
        const switchSlider = this.element('span', `switchSlider_${UID}`, 'switchSlider');
        
        switchInput.type = 'checkbox';

        if (labelText) 
            container.appendChild(label);

        controlWrapper.appendChild(switchControl);
        switchControl.appendChild(switchInput);
        switchControl.appendChild(switchSlider);
        container.appendChild(controlWrapper);

        if (colorInactive) 
            switchSlider.style.backgroundColor = colorInactive;

        if (colorActive)
            switchInput.addEventListener('change', () => {
                switchSlider.style.backgroundColor = switchInput.checked ? colorActive : (colorInactive || '');
            });

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            switchInput.addEventListener(eventType, functionCallback);
        }
        
        container.getValue = () => {
            return switchInput.checked;
        }

        return container;
    }
    
    textInput = (labelText = 'Text Input', placeholder = '', defaultValue = '') => {
        const UID = this.UID();
        const container = this.element('div', `textInputContainer_${UID}`, 'controlContainer');
        const label = this.element('div', `label_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper');
        const textInput = this.element('input', `textInput_${UID}`, 'textInput');

        textInput.type = 'text';
        textInput.placeholder = placeholder;
        textInput.value = defaultValue;
    
        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            textInput.addEventListener(eventType, functionCallback);
        }
        
        container.getValue = () => {
            return textInput.value;
        }

        if (labelText)
            container.appendChild(label);

        controlWrapper.appendChild(textInput);
        container.appendChild(controlWrapper);

        return container;
    }

    dropdown = (labelText  = 'Dropdown', options = [], defaultOption = null) => {
        const UID = this.UID();
        const container = this.element('div', `dropdownContainer_${UID}`, 'controlContainer');
        const label = this.element('div', `label_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper');
        const select = this.element('select', `dropdown_${UID}`, 'dropdown');

        options.forEach((option, index) => {
            let optionElement = this.element('option', `option_${index}_${UID}`, 'option', option.label);
            optionElement.value = option.value;
            if (defaultOption && option.value === defaultOption)
                optionElement.selected = true;
            select.appendChild(optionElement);
        });

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            select.addEventListener(eventType, functionCallback);
        }
        
        container.getValue = () => {
            return select.value;
        }

        if (labelText)
            container.appendChild(label);
        
        controlWrapper.appendChild(select);
        container.appendChild(controlWrapper);
        return container;
    }

    // ----------------------------------------
    // Advanced Controls 1
    // ----------------------------------------

    checkboxGroup = (labelText = null, options) => {
        const UID = this.UID();
        const container = this.element('div', `checkboxGroupContainer_${UID}`, 'controlContainer');
        const label = this.element('div', `label_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper');
        const checkboxGroup = this.element('div', `checkboxGroup_${UID}`, 'checkboxGroup');
        
        options.forEach(option => {
            const checkboxContainer = this.element('div', `checkboxContainer_${UID}`, 'checkboxContainer');
            const checkbox = this.element('input', `checkbox_${option.value}_${UID}`, 'checkbox');
            const checkboxLabel = this.element('label', null, 'checkboxLabel', option.label);
            checkbox.type = 'checkbox';
            checkbox.checked = option.checked || false;
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            checkboxGroup.appendChild(checkboxContainer);
        });

        if (labelText)
            container.appendChild(label);

        controlWrapper.appendChild(checkboxGroup);
        container.appendChild(controlWrapper);

        return container;
    }

    colorPicker = (labelText = 'Color Picker', defaultColor = '#000000') => {
        const UID = this.UID();
        const container = this.element('div', `colorPickerContainer_${UID}`, 'controlContainer');
        const label = this.element('div', `label_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper');

        const colorPicker = this.element('input', `colorPicker_${UID}`, 'colorPicker');
        const valueContainer = this.element('div', `valueContainer_${UID}`, 'colorValueContainer');
        const valueDisplay = this.element('input', `colorValue_${UID}`, 'colorValue');
        const formatToggle = this.element('button', `formatToggle_${UID}`, 'colorFormatToggle', 'HEX');

        colorPicker.type = 'color';
        colorPicker.value = defaultColor;        
        valueDisplay.type = 'text';
        valueDisplay.readOnly = true;
        valueDisplay.value = defaultColor;

        let currentFormat = 'hex';

        // Function to convert color to different formats
        const updateColorValue = () => {
            const hex = colorPicker.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            
            switch(currentFormat) {
                case 'hex':
                    valueDisplay.value = hex.toUpperCase();
                    break;
                case 'rgb':
                    valueDisplay.value = `RGB(${r}, ${g}, ${b})`;
                    break;
                case 'hsl':
                    // Convert RGB to HSL
                    const r1 = r / 255;
                    const g1 = g / 255;
                    const b1 = b / 255;
                    const max = Math.max(r1, g1, b1);
                    const min = Math.min(r1, g1, b1);
                    let h, s, l = (max + min) / 2;

                    if (max === min) {
                        h = s = 0;
                    } else {
                        const d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                        switch (max) {
                            case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
                            case g1: h = (b1 - r1) / d + 2; break;
                            case b1: h = (r1 - g1) / d + 4; break;
                        }
                        h = Math.round(h * 60);
                        if (h < 0) h += 360;
                    }
                    s = Math.round(s * 100);
                    l = Math.round(l * 100);
                    valueDisplay.value = `HSL(${h}, ${s}%, ${l}%)`;
                    break;
            }
        };

        // Event listeners
        colorPicker.addEventListener('input', updateColorValue);
        
        formatToggle.addEventListener('click', () => {
            switch(currentFormat) {
                case 'hex':
                    currentFormat = 'rgb';
                    formatToggle.textContent = 'RGB';
                    break;
                case 'rgb':
                    currentFormat = 'hsl';
                    formatToggle.textContent = 'HSL';
                    break;
                case 'hsl':
                    currentFormat = 'hex';
                    formatToggle.textContent = 'HEX';
                    break;
            }
            updateColorValue();
        });

        // Initial value update
        updateColorValue();

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            colorPicker.addEventListener(eventType, functionCallback);
        }
        
        container.getValue = () => {
            return colorPicker.value;
        }

        if (labelText) 
            container.appendChild(label);

        valueContainer.appendChild(valueDisplay);
        valueContainer.appendChild(formatToggle);
        controlWrapper.appendChild(colorPicker);
        controlWrapper.appendChild(valueContainer);
        container.appendChild(controlWrapper);
        
        return container;
    }

    sliderRange = (labelText = 'Slider Range', min = 0, max = 100, step = 1, defaultValue = 0) => {
        const UID = this.UID();
        const container = this.element('div', `sliderContainer_${UID}`, 'controlContainer');
        const label = this.element('label', `sliderLabel_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `sliderControlWrapper_${UID}`, 'controlWrapper');
        const sliderInput = this.element('input', `sliderInput_${UID}`, 'sliderRange');
        const sliderValueDisplay = this.element('span', `sliderValue_${UID}`, 'sliderValue');

        sliderInput.type = 'range';
        sliderInput.min = min;
        sliderInput.max = max;
        sliderInput.step = step;
        sliderInput.value = defaultValue;        
        sliderValueDisplay.textContent = defaultValue;

        // Method to update the slider value
        const updateSliderValue = () => {
            var value = (sliderInput.value-sliderInput.min)/(sliderInput.max-sliderInput.min)*100
            sliderInput.style.background = 'linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ' + value + '%, var(--border-color) ' + value + '%, var(--border-color) 100%)'
        }

        // Event listeners
        sliderInput.addEventListener('input', () => {
            sliderValueDisplay.textContent = sliderInput.value;
            updateSliderValue();
        });

        // Initial value update
        updateSliderValue();

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            sliderInput.addEventListener(eventType, functionCallback);
        }
        
        container.getValue = () => {
            return sliderInput.value;
        }

        if (labelText)
            container.appendChild(label)

        controlWrapper.appendChild(sliderInput);
        controlWrapper.appendChild(sliderValueDisplay);
        container.appendChild(controlWrapper);

        return container;
    }

    sliderStepper = (labelText = 'Slider Stepper', min = 0, max = 100, step = 1, defaultValue = 0) => {
        const UID = this.UID();
        const container = this.element('div', `sliderContainer_${UID}`, 'controlContainer');
        const label = this.element('label', `sliderLabel_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `sliderControlWrapper_${UID}`, 'controlWrapper');
        const sliderInput = this.element('input', `sliderInput_${UID}`, 'sliderStepper');
        const sliderValueDisplay = this.element('span', `sliderValue_${UID}`, 'sliderValue');
        const decrementBtn = this.element('button', `sliderButtonDecrement_${UID}`, 'sliderStepperButton', '-');
        const incrementBtn = this.element('button', `sliderButtonIncrement_${UID}`, 'sliderStepperButton', '+');

        sliderInput.type = 'range';
        sliderInput.min = min;
        sliderInput.max = max;
        sliderInput.step = step;
        sliderInput.value = defaultValue;
        sliderValueDisplay.textContent = defaultValue;

        // Method to update the slider value
        const updateSliderValue = () => {
            var value = (sliderInput.value-sliderInput.min)/(sliderInput.max-sliderInput.min)*100
            sliderInput.style.background = 'linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ' + value + '%, var(--border-color) ' + value + '%, var(--border-color) 100%)'
        }

        // Event listeners
        decrementBtn.addEventListener('click', () => {
            sliderInput.value = Math.max(min, parseFloat(sliderInput.value) - step);
            sliderValueDisplay.textContent = sliderInput.value;
            var value = (sliderInput.value-sliderInput.min)/(sliderInput.max-sliderInput.min)*100
            sliderInput.style.background = 'linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ' + value + '%, var(--border-color) ' + value + '%, var(--border-color) 100%)'
        });

        incrementBtn.addEventListener('click', () => {
            sliderInput.value = Math.min(max, parseFloat(sliderInput.value) + step);
            sliderValueDisplay.textContent = sliderInput.value;
            updateSliderValue();
        });

        sliderInput.addEventListener('input', () => {
            sliderValueDisplay.textContent = sliderInput.value;
            updateSliderValue();
        });

        // Initial value update
        updateSliderValue();

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            sliderInput.addEventListener(eventType, functionCallback);
        }
        
        container.getValue = () => {
            return sliderInput.value;
        }

        if (labelText) 
            container.appendChild(label);

        controlWrapper.appendChild(decrementBtn);
        controlWrapper.appendChild(sliderInput);
        controlWrapper.appendChild(incrementBtn);
        controlWrapper.appendChild(sliderValueDisplay);
        container.appendChild(controlWrapper);

        return container;
    }

    sliderInterval = (labelText = 'Slider Interval', min = 0, max = 100, step = 1, defaultValue = 25, defaultValueEnd = 75) => {
        const UID = this.UID();
        const container = this.element('div', `sliderContainer_${UID}`, 'controlContainer');
        const label = this.element('label', `sliderLabel_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `sliderControlWrapper_${UID}`, 'controlWrapper');
        const valueDisplayStart = this.element('span', `sliderValueStart_${UID}`, 'sliderValue', defaultValue);
        const sliderContainer = this.element('div', null, 'sliderInterval');
        const valueDisplayEnd = this.element('span', `sliderValueEnd_${UID}`, 'sliderValue', defaultValueEnd);
        const sliderStart = this.element('input', `sliderStart_${UID}`, 'slider');
        const sliderEnd = this.element('input', `sliderEnd_${UID}`, 'slider');
        
        [sliderStart, sliderEnd].forEach(slider => {
            slider.type = 'range';
            slider.min = min;
            slider.max = max;
            slider.step = step;
        });

        sliderStart.value = defaultValue;
        sliderEnd.value = defaultValueEnd;

        // Method to update the slider value
        const updateGradient = () => {
            const startVal = parseFloat(sliderStart.value);
            const endVal = parseFloat(sliderEnd.value);
            const startPercent = ((startVal - min) / (max - min)) * 100;
            const endPercent = ((endVal - min) / (max - min)) * 100;
            
            sliderStart.style.background = `linear-gradient(to right, 
                var(--border-color) 0%, 
                var(--border-color) ${startPercent}%, 
                var(--primary-color) ${startPercent}%, 
                var(--primary-color) ${endPercent}%, 
                var(--border-color) ${endPercent}%, 
                var(--border-color) 100%)`;
            
            valueDisplayStart.textContent = startVal;
            valueDisplayEnd.textContent = endVal;
        };

        // Initial value update
        updateGradient();

        // Event listeners
        sliderStart.addEventListener('input', () => {
            if (parseFloat(sliderStart.value) > parseFloat(sliderEnd.value)) {
                sliderStart.value = sliderEnd.value;
            }
            updateGradient();
        });

        sliderEnd.addEventListener('input', () => {
            if (parseFloat(sliderEnd.value) < parseFloat(sliderStart.value)) {
                sliderEnd.value = sliderStart.value;
            }
            updateGradient();
        });

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            sliderStart.addEventListener(eventType, functionCallback);
            sliderEnd.addEventListener(eventType, functionCallback);
        }
        
        container.getValue = () => {
            return { start: sliderStart.value, end: sliderEnd.value };
        }

        if (labelText) 
            container.appendChild(label);

        sliderContainer.appendChild(sliderStart);
        sliderContainer.appendChild(sliderEnd);
        controlWrapper.appendChild(valueDisplayStart);
        controlWrapper.appendChild(sliderContainer);
        controlWrapper.appendChild(valueDisplayEnd);
        container.appendChild(controlWrapper);

        return container;
    }

    // ----------------------------------------
    // Advanced Controls 2
    // ----------------------------------------
    
    vector2 = (labelText = 'Vector2', minX = -1, maxX = 1, minY = -1, maxY = 1, defaultX = 0, defaultY = 0, gridSize = 10, onChange = null) => {
        const UID = this.UID();
        const container = this.element('div', `vector2Container_${UID}`, 'vector2Container');
        const label = this.element('div', `vector2Label_${UID}`, 'label', labelText);
        const controlWrapper = this.element('div', `vector2ControlWrapper_${UID}`, 'controlWrapper');
        const area = this.element('div', `vector2Area_${UID}`, 'vector2Area');
        const grid = this.element('div', `vector2Grid_${UID}`, 'vector2Grid');
        const point = this.element('div', `vector2Point_${UID}`, 'vector2Point');
        const values = this.element('div', `vector2Values_${UID}`, 'vector2Values');
        const valueX = this.element('div', `vector2ValueX_${UID}`, 'vector2Value');
        const valueY = this.element('div', `vector2ValueY_${UID}`, 'vector2Value');
        const labelX = this.element('span', `vector2LabelX_${UID}`, 'vector2ValueLabel', 'X:');
        const labelY = this.element('span', `vector2LabelY_${UID}`, 'vector2ValueLabel', 'Y:');
        const valueXText = this.element('span', `vector2ValueXText_${UID}`);
        const valueYText = this.element('span', `vector2ValueYText_${UID}`);
        
        grid.style.setProperty('--grid-size', `${gridSize}px`);
        
        // Method to update Position
        const updatePosition = (x, y, updatePoint = true) => {
            const normalizedX = (x - minX) / (maxX - minX);
            const normalizedY = 1 - (y - minY) / (maxY - minY);
            
            if (updatePoint) {
                point.style.left = `${normalizedX * 100}%`;
                point.style.top = `${normalizedY * 100}%`;
            }
            
            valueXText.textContent = x.toFixed(2);
            valueYText.textContent = y.toFixed(2);
            
            if (onChange) onChange(x, y);
        };

        // Method to handle Drag
        let isDragging = false;

        const handleDrag = (e) => {
            if (!isDragging) return;

            const rect = area.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            
            const valueX = minX + x * (maxX - minX);
            const valueY = maxY - y * (maxY - minY);
            
            updatePosition(valueX, valueY);
        };

        const startDragging = (e) => {
            isDragging = true;
            const rect = area.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const valueX = minX + x * (maxX - minX);
            const valueY = maxY - y * (maxY - minY);
            
            updatePosition(valueX, valueY);
        };

        // Initial value update
        updatePosition(defaultX, defaultY);

        // Event listeners
        area.addEventListener('mousedown', startDragging);
        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', () => isDragging = false);

        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            area.addEventListener(eventType, functionCallback);
        }

        container.getValue = () => {
            return { x: valueX.textContent, y: valueY.textContent };
        }
        
        if (labelText) 
            container.appendChild(label);
        
        // Add Labels and Values
        valueX.appendChild(labelX);
        valueX.appendChild(valueXText);
        valueY.appendChild(labelY);
        valueY.appendChild(valueYText);
        // Add Grid and Point
        area.appendChild(grid);
        area.appendChild(point);
        values.appendChild(valueX);
        values.appendChild(valueY);
        // Add Area and Values to Control Wrapper
        controlWrapper.appendChild(area);
        controlWrapper.appendChild(values);
        // Add Control Wrapper to Container
        container.appendChild(controlWrapper);
        
        return container;
    }
    
    joystick = (labelText = 'Joystick', showDetails = false, size = null, onChange = null) => {
        const UID = this.UID();
        const container = this.element('div', `joystickContainer_${UID}`, 'joystickContainer');
        const label = this.element('div', `joystickLabel_${UID}`, 'label', labelText);
        const joystickArea = this.element('div', `joystickArea_${UID}`, 'joystickArea');
        const joystick = this.element('div', `joystick_${UID}`, 'joystick');
        const valueDisplay = this.element('div', `joystickValue_${UID}`, 'joystickValue');
        
        // Method to get dimensions
        const setDimensions = () => {
            const parentElement = container.parentElement;
            if (parentElement) {
                const parentRect = parentElement.getBoundingClientRect();
                const areaSize = size || Math.min(parentRect.width, parentRect.height);
                joystickArea.style.width = `${areaSize}px`;
                joystickArea.style.height = `${areaSize}px`;
                joystick.style.width = `${areaSize * 0.3}px`;
                joystick.style.height = `${areaSize * 0.3}px`;
                return areaSize;
            }
            return size || 200;
        };

        // Method to update Display
        const setUpdateDisplay = (deltaY, deltaX, distance, radius) => {
            let direction = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                
            // Calculate normalized X/Y coordinates (-1 to +1)
            const normalizedCoordX = Math.cos(direction * Math.PI / 180);
            const normalizedCoordY = Math.sin(direction * Math.PI / 180);
            
            // Calculate magnitude (0-1)
            const magnitude = Math.min(distance / radius, 1);
            
            valueDisplay.textContent = `Direction: ${Math.round(direction)}°, Speed: ${magnitude.toFixed(2)}, X: ${(normalizedCoordX * magnitude).toFixed(2)}, Y: ${(normalizedCoordY * magnitude).toFixed(2)}`;
            
            if (onChange) {
                onChange(direction, magnitude, normalizedCoordX * magnitude, normalizedCoordY * magnitude);
            }            
        }

        // Method to update Position
        const updateStickPosition = (x, y, updateDisplay = true) => {
            const areaRect = joystickArea.getBoundingClientRect();
            const centerX = areaRect.width / 2;
            const centerY = areaRect.height / 2;
            
            // Calculate distance from center
            const deltaX = x - centerX;
            const deltaY = centerY - y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const radius = areaRect.width / 2 - 20;
            
            // Normalize if outside bounds
            let normalizedX = x;
            let normalizedY = y;
            if (distance > radius) {
                const angle = Math.atan2(deltaY, deltaX);
                normalizedX = centerX + Math.cos(angle) * radius;
                normalizedY = centerY - Math.sin(angle) * radius;
            }
            
            // Update stick position
            joystick.style.left = `${normalizedX}px`;
            joystick.style.top = `${normalizedY}px`;
            
            if (updateDisplay) 
                setUpdateDisplay(deltaY, deltaX, distance, radius);
        };

        // Method to handle Drag
        let isDragging = false;

        const handleDrag = (e) => {
            if (!isDragging) return;
            
            const rect = joystickArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            updateStickPosition(x, y);
        };

        // Event listeners
        joystickArea.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = joystickArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            updateStickPosition(x, y);
        });

        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                const rect = joystickArea.getBoundingClientRect();
                updateStickPosition(rect.width / 2, rect.height / 2);
            }
        });

        // Initial value update
        setUpdateDisplay(0, 0, 0, 1);

        if (labelText) 
            container.appendChild(label);
        joystickArea.appendChild(joystick);
        container.appendChild(joystickArea);
        if (showDetails)
            container.appendChild(valueDisplay);

        // Update position after adding to DOM
        requestAnimationFrame(() => {
            const areaSize = setDimensions();
            updateStickPosition(areaSize / 2, areaSize / 2, false);
        });

        return container;
    }

    // ----------------------------------------
    // Advanced Containers
    // ----------------------------------------

    folder = (titleText = 'Folder', iconClose = null, iconOpen = null, bgColor = null, bgColorHover = null, defaultClosed = false, controls = []) => {
        const UID = this.UID();
        const folder = this.element('div', `folder_${UID}`, 'folder');
        const folderHeader = this.element('div', `folderHeader_${UID}`, 'folderHeader');
        const folderTitle = this.element('div', `folderTitle_${UID}`, 'folderTitle', titleText);
        const folderIcon = this.element('div', `folderIcon_${UID}`, 'folderIcon');
        const folderToggleButton = this.element('div', `folderToggleButton_${UID}`, 'folderToggleButton');
        const contentContainer = this.element('div', `folderContent_${UID}`, 'folderContent');

        if (bgColor) {
            folderHeader.style.backgroundColor = bgColor;
        }

        if (bgColorHover) {
            folderHeader.dataset.hoverColor = bgColorHover;
            folderHeader.addEventListener('mouseenter', e => e.target.style.backgroundColor = bgColorHover);
            folderHeader.addEventListener('mouseleave', e => e.target.style.backgroundColor = bgColor || '');
        }

        if (defaultClosed) {
            contentContainer.classList.add('collapsed');
            folderToggleButton.innerHTML = '<div class="icon icon-chevron-up"></div>';
            folderIcon.innerHTML = (iconClose) ? `<div class="icon ${iconClose}"></div>` : (iconClose !== false) ?'<div class="icon icon-folder-close"></div>' : '';
        } else {
            folderToggleButton.innerHTML = '<div class="icon icon-chevron-down"></div>';
            folderIcon.innerHTML = (iconOpen) ? `<div class="icon ${iconOpen}"></div>` : (iconOpen !== false) ? '<div class="icon icon-folder-open"></div>' : '';
        }
        
        // Add Controls
        controls.forEach(control => {
            contentContainer.appendChild(control);
        });
        
        // Methods to open/close folder
        folder.collapse = () => {
            contentContainer.classList.add('collapsed');
            folderToggleButton.innerHTML = '<div class="icon icon-chevron-up"></div>';
            folderIcon.innerHTML = (iconClose) ? `<div class="icon ${iconClose}"></div>` : (iconClose !== false) ? '<div class="icon icon-folder-close"></div>' : '';
        }
        folder.expand = () => {
            contentContainer.classList.remove('collapsed');
            folderToggleButton.innerHTML = '<div class="icon icon-chevron-down"></div>';
            folderIcon.innerHTML = (iconOpen) ? `<div class="icon ${iconOpen}"></div>` : (iconOpen !== false) ? '<div class="icon icon-folder-open"></div>' : '';
        }

        // Collapse/Expand Event
        folderHeader.addEventListener('click', () => {
            contentContainer.classList.toggle('collapsed');
            if (contentContainer.classList.contains('collapsed')) {   
               folder.collapse();
            } else {
                folder.expand();
            }
        });
        
        folderHeader.appendChild(folderIcon);
        folderHeader.appendChild(folderTitle);
        folderHeader.appendChild(folderToggleButton);
        folder.appendChild(folderHeader);
        folder.appendChild(contentContainer);
        return folder;
    }

    tabPage = (titleText = 'Tab', icon = null, controls = []) => {       
        const UID = this.UID();
        const tabPage = this.element('div', `tabPage_${UID}`, 'tabPage');
        const tabPageButton = this.element('button', `tabPageButton_${UID}`, 'tabPageButton');
        
        if (titleText)
            tabPageButton.textContent = titleText;

        if (icon) {
            const tabPageIcon = this.element('div', `tabPageIcon_${UID}`, 'icon');
            tabPageIcon.classList.add(icon);
            tabPageButton.insertBefore(tabPageIcon, tabPageButton.firstChild);
        }

        // Controls Container
        const tabPageControls = this.element('div', `tabPageControls_${UID}`, 'tabPage-controls');
        controls.forEach(control => {
            tabPageControls.appendChild(control);
        });

        tabPage.appendChild(tabPageControls);    
        return { tabPage, tabPageButton };
    }

    tabs = (pages = [], defaultPage = 0) => {
        const UID = this.UID();
        const tabs = this.element('div', `tabContainer_${UID}`, 'tabContainer');
        const tabBar = this.element('div', `tabBar_${UID}`, `tabBar`);
        const tabContentContainer = this.element('div', `tabContentContainer_${UID}`, 'tabContentContainer');
        
        pages.forEach((page, index) => {
            const tabContent = this.element('div', `tabContent_${index}_${UID}`, 'tabContent');
            const { tabPage, tabPageButton } = page;
            tabContent.appendChild(tabPage);
            tabBar.appendChild(tabPageButton);
            tabContentContainer.appendChild(tabContent);

            // Set default page
            if (index === defaultPage) {
                tabPageButton.classList.add('active');
                tabContent.classList.add('active');
            }
            
            // Event listener for tab button
            tabPageButton.addEventListener('click', () => {
                tabBar.querySelectorAll('.tabPageButton').forEach(t => t.classList.remove('active'));
                tabContentContainer.querySelectorAll('.tabContent').forEach(c => c.classList.remove('active'));
                tabPageButton.classList.add('active');
                tabContent.classList.add('active');
            });
        });
        
        tabs.appendChild(tabBar);
        tabs.appendChild(tabContentContainer);
        return tabs;
    }

    // ----------------------------------------
    // Faceplate
    // ----------------------------------------

    faceplate = (controls = [], width = null, height = null, positionX = null, positionY = null) => {
        const UID = this.UID();
        const faceplate = this.element('div', `faceplate_${UID}`, 'faceplate');

        // Configurations
        if (width)      faceplate.style.width = `${width}px`;
        if (height)     faceplate.style.height = `${height}px`;
        if (positionX > 0)  faceplate.style.left = `${positionX}px`;
        if (positionY > 0)  faceplate.style.top = `${positionY}px`;      
        if (positionX < 0)  faceplate.style.right = `${positionX*-1}px`;
        if (positionY < 0)  faceplate.style.bottom = `${positionY*-1}px`;
        
        // Add Controls
        controls.forEach(control => {
            faceplate.appendChild(control);
        });
        
        return faceplate;
    }

    // ----------------------------------------
    // Draggable and Resizable
    // ----------------------------------------

    setDraggable = (element, handle = null) => {
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        
        const dragHandle = handle || element;
        
        dragHandle.style.cursor = 'grab';
        
        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragHandle.style.cursor = 'grabbing';
            
            // Obtener la escala actual
            const scale = element.style.transform ? 
                parseFloat(element.style.transform.replace('scale(', '').replace(')', '')) : 1;
            
            initialX = e.clientX - element.offsetLeft;
            initialY = e.clientY - element.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                
                // Obtener la escala actual
                const scale = element.style.transform ? 
                    parseFloat(element.style.transform.replace('scale(', '').replace(')', '')) : 1;
                
                // Calcular la nueva posición
                currentX = (e.clientX - initialX);
                currentY = (e.clientY - initialY);

                // Ajustar los límites considerando el espacio extra debido a la escala
                const maxX = window.innerWidth - (element.offsetWidth * scale);
                const maxY = window.innerHeight - (element.offsetHeight * scale);
                
                // El mínimo ahora es negativo para compensar la reducción de escala
                const minX = element.offsetWidth * (scale - 1);
                const minY = element.offsetHeight * (scale - 1);
                
                currentX = Math.max(minX, Math.min(currentX, maxX));
                currentY = Math.max(minY, Math.min(currentY, maxY));

                // Aplicar la posición
                element.style.left = currentX + 'px';
                element.style.top = currentY + 'px';
                element.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            dragHandle.style.cursor = 'grab';
        });
    }

    setResizable = (element) => {
        let isResizing = false;
        let initialWidth, initialHeight, initialX, initialY;

        const resizer = this.element('div', null, 'resizer');
        element.appendChild(resizer);

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            initialWidth = element.offsetWidth;
            initialHeight = element.offsetHeight;
            initialX = e.clientX;
            initialY = e.clientY;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (isResizing) {
                const width = initialWidth + (e.clientX - initialX);
                const height = initialHeight + (e.clientY - initialY);
                element.style.width = `${Math.max(250, width)}px`;
                element.style.height = `${Math.max(200, height)}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    // ----------------------------------------
    // Inject styles to the head (Not used, prefer to use the css file on development)
    // ----------------------------------------
    /*addStyles = () => {
        var styles = ``;
        var styleSheet = document.createElement("style")
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    }*/


    // ----------------------------------------
    // Icon Bars - Floating bars (WORK IN PROGRESS - WIP)
    // ----------------------------------------

    iconBarHorizontal = () => this.element('div','iconBarHorizontal_' + this.UID(), 'iconBarHorizontal');
    iconBarButton = () => this.element('div','iconBarButton_' + this.UID(), 'iconBarButton');
    iconBarVertical = (position = 'left') => {
        const UID = this.UID();
        const iconBar = this.element('div', `iconBarVertical_${UID}`, 'iconBarVertical');
        iconBar.classList.add(`iconBarVertical-${position}`);
        return iconBar;
    }

}