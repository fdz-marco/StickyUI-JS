/**
 * StickyUI
 * A simple class to create user interfaces over the browser DOM
 * specially useful for canvas-based applications or HMIs.
 * @version 1.0.3
 * @date 2025-04-13
 * @author Marco Fernandez (marcofdz.com)
 * @license MIT
 * @website https://marcofdz.com/projects/stickyui
 * @repository https://github.com/fdz-marco/StickyUI-JS
 * @file StickyUI.js
 */

class StickyUI {
    #classBase = 'stickyUI';
    #theme = 'dark';
    #customEvents = [];
    #listeners = [];

    // ----------------------------------------
    // #region Constructor
    // =======================================>

    /**
     * Constructor
     */
    constructor() {
        // Inject styles to the head (Not used, prefer to use the css file)
        //this.addStyles();

        // Init the theme according to the system preferences
        this.theme.applyStoredTheme();
    }
    
    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Aliases for window, document, document.body
    // =======================================>

    /**
     * Aliases for document and document.body
     */
    body = {     
        /**
         * Create a new element
         * @param {string} type Type of the element to create
         * @returns {HTMLElement} Created element
         */
        create: (type) => {
            return document.createElement(type);
        },
        /**
         * Alias for document.body.appendChild
         * @param {DOMElement | string | Array<DOMElement | string>} content Content to append to the document body
         */
        add: (content) => {
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
        },
        /**
         * Alias for document.body.removeChild
         * @param {DOMElement | string | Array<DOMElement | string>} content Content to remove from the document body
         */
        remove: (content) => {
            if (content !== null && typeof content === 'object') {
                if (content instanceof Array) {
                    content.forEach(item => {
                        document.body.removeChild(item);
                    });
                } else {
                    document.body.removeChild(content);
                }
            }
        },
        /**
         * Alias for document.querySelector
         * @param {string} selector Selector to query
         * @returns {DOMElement} First element that matches the selector
         */
        query: (selector) => {
            return document.querySelector(selector);
        },
        /**
         * Alias for document.querySelectorAll
         * @param {string} selector Selector to query
         * @returns {Array<DOMElement>} All elements that match the selector
         */
        queryAll: (selector) => {
            return document.querySelectorAll(selector);
        },
        /**
         * Alias for document.addEventListener and add the listener to the listeners array
         * @param {string} event Event to listen to
         * @param {function} callback Callback to call when the event is triggered
         */
        listenEvent: (event, callback) => {
            document.addEventListener(event, callback);
            this.#listeners.push({ listener: 'document', event, callback, element: null });
        },
        /**
         * Alias for document.removeEventListener and remove the listener from the listeners array
         * @param {string} event Event to remove
         * @param {function} callback Callback to remove
         */
        unlistenEvent: (event, callback) => {
            document.removeEventListener(event, callback);
            this.#listeners = this.#listeners.filter(listener => listener.listener !== 'document' || listener.event !== event || listener.callback !== callback);
        },
        /**
         * Alias for document.getElementById
         * @param {string} id Id of the element to get
         * @returns {DOMElement} Element with the given id
         */
        getById: (id) => {
            return document.getElementById(id);
        },
        /**
         * Alias for document.getElementsByClassName
         * @param {string} className Class name to get
         * @returns {DOMElement} First element with the given class name
         */
        getByClass: (className) => {
            const elements = document.getElementsByClassName(className);
            return elements.length > 0 ? elements[0] : null;
        },
        /**
         * Alias for document.getElementsByName
         * @param {string} name Name of the element to get
         * @returns {DOMElement} First element with the given name
         */
        getByName: (name) => {
            return document.getElementsByName(name);
        },
        /**
         * Alias for document.new CustomEvent
         * @param {string} eventName Name of the event to create
         * @param {object} data Data to pass to the event
         * @returns {CustomEvent} Created event
         */
        createEvent: (eventName, data = null) => {
            const event = new CustomEvent(eventName, data);
            this.#customEvents.push(event);
            return event;
        },
        /**
         * Destroy a custom event
         * @param {CustomEvent} event Event to destroy
         */
        destroyEvent: (event) => {
            if (event instanceof CustomEvent) { 
                this.#customEvents = this.#customEvents.filter(e => e !== event);
            }
        },      
        /**
         * Alias for document.dispatchEvent
         * @param {CustomEvent} event Event to trigger
         */
        triggerEvent: (event) => {
            document.dispatchEvent(event);
        },
        /**
         * Check if an element is in the DOM
         * @param {DOMElement} element Element to check
         * @returns {boolean} True if the element is in the DOM, false otherwise
         */ 
        isInDOM: (element) => {
            return document.body.contains(element);
        }
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Theme
    // =======================================>

    /**
     * Theme methods to get and switch the theme
     */
    theme = {
        /**
         * Get the current theme
         * @returns {string} Current theme
         */
        getTheme: () => {
            return this.#theme;
        },
        /**
         * Switch theme
         * @param {string} theme Theme's name to switch to
         */
        switchTheme: (theme = null) => {
            // If no theme is provided, toggle between the themes
            if (theme === null)
                theme = this.#theme === 'dark' ? 'light' : 'dark';
            // Validate the theme
            if (theme !== 'dark' && theme !== 'light') {
                console.error('Invalid theme. Use "dark" or "light".');
                return;
            }
            // Save the current theme
            this.#theme = theme;
            // Apply the theme to the document
            document.documentElement.setAttribute('data-theme', theme);
            console.log('Theme applied:', theme);
            // Create and send a theme change event
            const event = this.body.createEvent('theme-change', { theme: theme });
            this.body.triggerEvent(event);
            // Save preference in localStorage to keep it between sessions
            try {
                localStorage.setItem(`${this.#classBase}-theme`, theme);
            } catch (e) {
                console.warn('Could not save theme in localStorage.');
            }
            return theme;
        },
        /**
         * Apply the stored theme
         */
        applyStoredTheme: () => {
            let storedTheme = null;
            // Try to recover the saved theme
            try {
                storedTheme = localStorage.getItem(`${this.#classBase}-theme`);
            } catch (e) {
                console.warn('Could not recover theme from localStorage.');
            }
            // If there is a saved theme, apply it
            if (storedTheme) {
                this.theme.switchTheme(storedTheme);
            } else {
                // If there is no saved theme, use the system preference
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.theme.switchTheme(prefersDark ? 'dark' : 'light');
            }
        }
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Basic Components & Methods
    // =======================================>
    
    /**
     * Generate a random UID (to avoid duplicate IDs)
     * @param {number} length Length of the UID
     * @returns {string} Generated UID
     */
    UID(length = 5) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() *  chars.length));
        }
        return result;
    }

    /**
     * @typedef {Object} UIElementBase (Base) UI HTML Element with custom methods
     * @property {function(): string} getType - Get the type of the element
     * @property {function(string|HTMLElement|Array<HTMLElement>): void} add - Add content to the element, alias for appendChild (content)
     * @property {function(string|HTMLElement|Array<HTMLElement>): void} replace - Replace the content of the element, alias for innerHTML (content)
     * @property {function(): void} removeAll - Remove all child elements from the element
     * @property {function(string|HTMLElement|Array<HTMLElement>): void} listenEvent - Listen to an event, alias for addEventListener (event, callback)
     * @property {function(string|HTMLElement|Array<HTMLElement>): void} unlistenEvent - Unlisten to an event, alias for removeEventListener (event, callback) 
     * @property {function(string|Array<string>): void} addClass - Add a class to the element, alias for classList.add (className)
     * @property {function(string|Array<string>): void} removeClass - Remove a class from the element, alias for classList.remove (className)
     * @property {function(string|Array<string>): void} toggleClass - Toggle a class to the element, alias for classList.toggle (className)
     * @property {function(string|Array<string>): boolean} hasClass - Check if the element has a class, alias for classList.contains (className)
     * @property {function(string): HTMLElement} query - Query a child element, alias for querySelector (selector)
     * @property {function(string): NodeList} queryAll - Query all child elements, alias for querySelectorAll (selector)
     * @property {function(HTMLElement): boolean} isIn - Check if the element is inside another element, alias for element.contains (targetElement)
     */

    /**
     * @typedef {HTMLElement & UIElementBase} UIElement UI HTML Element with custom methods
     */

    /**
     * Creates a UI HTML Element in DOM (UIElement)
     * @param {string} type Type of the element to create
     * @param {string} id Id of the element to create
     * @param {string} className Class name of the element to create
     * @param {string} content Content of the element to create
     * @param {string} UItype Type of the UIElement to create
     * @returns {UIElement} Created element
     */
    element(type, id = null, className = null, content = null, UItype = 'element') {
        // Create the element
        let element = this.body.create(type);
        if (id !== null) 
            element.id = id;
        if (UItype !== null)
            element.dataset.uiType = UItype;

        // External methods
        element.getType = () => {
            return element.dataset.uiType ?? 'element';
        }
        element.add = (content) => {
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
        element.replace = (content) => {
            element.innerHTML = '';
            element.add(content);
        };
        element.removeAll = () => {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        };
        element.listenEvent = (event, callback) => {
            element.addEventListener(event, callback);
            this.#listeners.push({ listener: `${type}#${UItype}#${element.id}`, event, callback, element });
        };     
        element.unlistenEvent = (event, callback) => {
            element.removeEventListener(event, callback);
            this.#listeners = this.#listeners.filter(listener => listener.listener !== `${type}#${UItype}#${element.id}` || listener.event !== event || listener.callback !== callback);
        };
        element.triggerEvent = (event) => {
            element.dispatchEvent(event);
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
        element.query = (selector) => {
            return element.querySelector(selector);
        }
        element.queryAll = (selector) => {
            return element.querySelectorAll(selector);
        }
        element.isIn = (targetElement) => {
            return targetElement.contains(element);
        }

        // Add the class and content (Invoked after methods)
        element.addClass(`${this.#classBase} ${className}`);
        element.add(content);

        // Return the element
        return element;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Private Helper Methods
    // =======================================>

    /**
     * Position and dimension helper methods
     */
    #utils = {
        /**
         * Get element position and dimensions
         * @param {HTMLElement} element Element to get the position and dimensions of
         * @returns {{width: number, height: number, xLeft: number, xCenter: number, xRight: number, yTop: number, yCenter: number, yBottom: number}} Position and dimensions of the element (width, height, xLeft, xCenter, xRight, yTop, yCenter, yBottom)
         */
        __getElemPosDim: (element) => {
            const rect = element.getBoundingClientRect();
            const width = parseFloat(rect.width);
            const height = parseFloat(rect.height);
            const xLeft = parseFloat(rect.left);
            const xCenter = xLeft + (width / 2);
            const xRight = xLeft + width;
            const yTop = parseFloat(rect.top);
            const yCenter = yTop + (height / 2);
            const yBottom = yTop + height;
            return { width, height, xLeft, xCenter, xRight, yTop, yCenter, yBottom }
        },
        /**
         * Get element dimensions, if needed make it visible temporarily outside of the viewport to measure its dimensions
         * @param {HTMLElement} element Element to get the dimensions of
         * @returns {{width: number, height: number}} Dimensions of the element (width, height)
         */
        __getElemDim: (element) => {
            // Save the original style
            const _style = {
                visibility: element.style.visibility ?? null,
                display: element.style.display ?? null,
                position: element.style.position ?? null,
                top: element.style.top ?? null,
                left: element.style.left ?? null
            };
            if (
                (_style.display !== null && (_style.display === 'none' || _style.display === '')) || 
                (_style.visibility !== null && (_style.visibility === 'hidden' || _style.visibility === '')) 
            ) {
                // Make the target element visible temporarily outside of the viewport to measure
                element.style.visibility = 'hidden';
                element.style.display = 'block';
                element.style.position = 'fixed';
                element.style.top = '-9999px';
                element.style.left = '-9999px';
            }
            // Get the dimensions
            const rect = element.getBoundingClientRect();
            const width = parseFloat(rect.width);
            const height = parseFloat(rect.height);
            // Restore the original style
            if (
                (_style.display !== null && (_style.display === 'none' || _style.display === '')) || 
                (_style.visibility !== null && (_style.visibility === 'hidden' || _style.visibility === '')) 
            ) {
                if (_style.visibility !== null) element.style.visibility = _style.visibility;
                if (_style.display !== null) element.style.display = _style.display;
                if (_style.position !== null) element.style.position = _style.position;
                if (_style.top !== null) element.style.top = _style.top;
                if (_style.left !== null) element.style.left = _style.left;
            }
            return { width, height };
        },
        /**
         * Get the position to display of a target element relative to a reference element
         * @param {HTMLElement} referenceElement Reference element (The object element which will be used as a reference to display the target element)
         * @param {HTMLElement} targetElement Target element (The object element which will be displayed)
         * @param {string} refAnchor Reference element anchor point (Anchors: top-left, top-center, top-right | bottom-left, bottom-center, bottom-right | left-top, left-center, left-bottom | right-top, right-center, right-bottom)
         * @param {string} targetAnchor Target element anchor point (Anchors: top-left, top-center, top-right | bottom-left, bottom-center, bottom-right | left-top, left-center, left-bottom | right-top, right-center, right-bottom)
         * @param {{x: number, y: number}|number} offset Offset of the target element relative to the reference element (x, y) or number
         * @param {number} viewportMargin Margin of the viewport
         * @returns {{x: number, y: number, refAnchor: string, targetAnchor: string}} Position of the target element relative to the reference element (x, y, refAnchor, targetAnchor)
         */
        __getElemPosToDisplay: (referenceElement, targetElement, refAnchor = 'right-bottom', targetAnchor = 'top-left',  offset = { x: 0, y: 0 }, viewportMargin = 0) => {        
            // Get the reference element dimensions and position
            const { 
                width: refWidth, height: refHeight, 
                xLeft: refXLeft, xCenter: refXCenter, xRight: refXRight, 
                yTop: refYTop, yCenter: refYCenter, yBottom: refYBottom 
            } = this.#utils.__getElemPosDim(referenceElement);
            // Get the target element dimensions and position
            const { width: targetWidth, height: targetHeight } = this.#utils.__getElemDim(targetElement);
            // Get the viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            // Get offset object
            if (typeof offset === 'number') {
                offset = { x: offset, y: offset };
            }
            // Calculate available space in each direction from the reference element
            const spaceRight = viewportWidth - refXRight;
            const spaceLeft = refXLeft;
            const spaceBottom = viewportHeight - refYBottom;
            const spaceTop = refYTop;
            // Determine best position based on available space
            const _refAnchorMain = refAnchor.split('-')[0];
            // Check horizontal space and adjust if necessary
            if (_refAnchorMain.includes('right') && spaceRight < targetWidth + viewportMargin) {
                refAnchor = refAnchor.replace('right', 'left');
                targetAnchor = targetAnchor.replace('left', 'right');
                offset.x = -offset.x;
            } else if (_refAnchorMain.includes('left') && spaceLeft < targetWidth + viewportMargin) {
                refAnchor = refAnchor.replace('left', 'right');
                targetAnchor = targetAnchor.replace('right', 'left');
                offset.x = -offset.x;
            }
            // Determine best position based on available space
            // Check vertical space and adjust if necessary
            if (_refAnchorMain.includes('bottom') && spaceBottom < targetHeight + viewportMargin) {
                refAnchor = refAnchor.replace('bottom', 'top');
                targetAnchor = targetAnchor.replace('top', 'bottom');
                offset.y = -offset.y;
            } else if (_refAnchorMain.includes('top') && spaceTop < targetHeight + viewportMargin) {
                refAnchor = refAnchor.replace('top', 'bottom');
                targetAnchor = targetAnchor.replace('bottom', 'top');
                offset.y = -offset.y;
            }
            // Determine the base position relative to the reference element
            let baseX, baseY;
            const [refAnchorMain, refAnchorSub] = refAnchor.split('-');
            if (refAnchorMain === 'top') {
                baseY = refYTop;
                if (refAnchorSub === 'left') baseX = refXLeft; // top-left
                else if (refAnchorSub === 'right') baseX = refXRight; // top-right
                else baseX = refXCenter; // top-center
            } 
            else if (refAnchorMain === 'bottom') {
                baseY = refYBottom;
                if (refAnchorSub === 'left') baseX = refXLeft; // bottom-left
                else if (refAnchorSub === 'right') baseX = refXRight; // bottom-right
                else baseX = refXCenter; // bottom-center
            }
            else if (refAnchorMain === 'left') {
                baseX = refXLeft;
                if (refAnchorSub === 'top') baseY = refYTop; // left-top
                else if (refAnchorSub === 'bottom') baseY = refYBottom;
                else baseY = refYCenter; // center
            }
            else if (refAnchorMain === 'right') {
                baseX = refXRight;
                if (refAnchorSub === 'top') baseY = refYTop; // right-top
                else if (refAnchorSub === 'bottom') baseY = refYBottom; // right-bottom
                else baseY = refYCenter; // right-center
            }
            // Adjust position based on the targetAnchor 
            // (which part of the target element should be placed at the base position)
            let finalX = baseX, finalY = baseY;
            const [targetAnchorMain, targetAnchorSub] = targetAnchor.split('-');        
            // Adjust X position based on targetAnchor
            if (targetAnchorMain === 'left' || targetAnchorSub === 'left') { // left-top, left-center, left-bottom || top-left, center-left, bottom-left
                // No adjustment needed for left alignment
            } else if (targetAnchorMain === 'right' || targetAnchorSub === 'right') { // right-top, right-center, right-bottom || top-right, center-right, bottom-right
                finalX -= targetWidth;
            } else if (targetAnchorMain === 'center' || targetAnchorSub === 'center') { // top-center, bottom-center, left-center, right-center
                finalX -= targetWidth / 2;
            }
            // Adjust Y position based on targetAnchor
            if (targetAnchorMain === 'top' || targetAnchorSub === 'top') { // top-left, top-center, top-right || left-top, center-top, right-top  
                // No adjustment needed for top alignment
            } else if (targetAnchorMain === 'bottom' || targetAnchorSub === 'bottom') { // bottom-left, bottom-center, bottom-right || left-bottom, center-bottom, right-bottom
                finalY -= targetHeight;
            } else if (targetAnchorMain === 'center' || targetAnchorSub === 'center') { // top-center, bottom-center, left-center, right-center
                finalY -= targetHeight / 2;
            }
            // Apply additional offset
            finalX += offset.x;
            finalY += offset.y;
            // Ensure menu stays within viewport bounds
            finalX = Math.max(viewportMargin, Math.min(finalX, viewportWidth - targetWidth - viewportMargin));
            finalY = Math.max(viewportMargin, Math.min(finalY, viewportHeight - targetHeight - viewportMargin));
            return { x: finalX, y: finalY, refAnchor, targetAnchor };
        }
    }

    /**
     * Toolbar helper methods
     */
    #toolbarUtils = {
        /**
         * Handle multiple toolbars at top (stack them from top to bottom)
         * Get the top offset of the toolbars:
         * (1) If toolbar is given, calculate the offset relative to it.
         * (2) If no toolbar is given, calculate the offset of all top toolbars
         * @param {UIElement} relativeTo - Toolbar element to calculate the offset relative to (Optional)
         * @returns {number} Top offset of the toolbars
         */
        __getToolbarTopOffset: (relativeTo = null) => {
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
        },
        /**
         * Handle multiple toolbars at bottom (stack them from bottom to top)
         * Get the bottom offset of the toolbars:
         * (1) If toolbar is given, calculate the offset relative to it.
         * (2) If no toolbar is given, calculate the offset of all bottom toolbars
         * @param {UIElement} relativeTo - Toolbar element to calculate the offset relative to (Optional)
         * @returns {number} Bottom offset of the toolbars
         */
        __getToolbarBottomOffset: (relativeTo = null) => {
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
        },
        /**
         * Handle multiple toolbars at left (stack them from left to right)
         * Get the left offset of the toolbars:
         * (1) If toolbar is given, calculate the offset relative to it.
         * (2) If no toolbar is given, calculate the offset of all left toolbars
         * @param {UIElement} relativeTo - Toolbar element to calculate the offset relative to (Optional)
         * @returns {number} Left offset of the toolbars
         */
        __getToolbarLeftOffset: (relativeTo = null) => {
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
        },
        /**
         * Handle multiple toolbars at right (stack them from right to left)
         * Get the right offset of the toolbars:
         * (1) If toolbar is given, calculate the offset relative to it.
         * (2) If no toolbar is given, calculate the offset of all right toolbars
         * @param {UIElement} relativeTo - Toolbar element to calculate the offset relative to (Optional)
         * @returns {number} Right offset of the toolbars
         */
        __getToolbarRightOffset: (relativeTo = null) => {
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
    }

    /**
     * UI Updaters helper methods
     */
    #UIUpdaters = {
        /** 
         * Update the position of the toolbars
        */
        __updatePositionToolbars: () => {
            const toolbars = this.body.queryAll(`.${this.#classBase}.toolbar`);
            toolbars.forEach(toolbar => toolbar.updatePosition());
        },
        /**
         * Update the position of the side panels
         */
        __updatePositionSidePanels: () => {
            const sidePanels = this.body.queryAll(`.${this.#classBase}.sidePanel`);
            sidePanels.forEach(sidePanel => sidePanel.updatePosition());
        },
        /**
         * Update the position of the workspace
         */
        __updatePositionWorkspace: () => {
            const workspace = this.body.query(`.${this.#classBase}.workspace`);
            workspace.updatePosition();
        }
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Icon
    // =======================================>

    /**
     * @typedef {Object} UIIconBase (Base) Icon Element
     * @property {function(string): void} changeIcon - Change the icon of the element (iconName)
     * @property {function(number, string): void} setWidth - Set the width of the element (width, unit)
     * @property {function(number, string): void} setHeight - Set the height of the element (height, unit)
     * @property {function(number, string): void} setSize - Set the size of the element (size, unit)
     * @property {function(string): void} setColor - Set the color of the element (color)
     */

    /**
     * @typedef {UIElement & UIIconBase} UIIcon Icon Element
     */

    /**
     * Creates an icon element
     * @param {string} iconName Name of the icon to create
     * @returns {UIIcon} Created icon element
     */
    icon(iconName = null) {
        // Create the element
        const UID = this.UID();
        let _currentIcon = iconName;
        const iconElement = this.element('div',`icon_${UID}`, 'icon', null, 'icon');

        // Add the class (icon name is the class name)
        if (iconName)
            iconElement.addClass(iconName)
            
        // External methods
        iconElement.changeIcon = (iconName) => {
            iconElement.removeClass(_currentIcon);
            iconElement.addClass(iconName);
            _currentIcon = iconName;
        }
        iconElement.setWidth = (width, unit = 'px') => {
            if (width !== null && typeof width === 'number')
                iconElement.style.width = `${width}${unit}`;
        }
        iconElement.setHeight = (height, unit = 'px') => {
            if (height !== null && typeof height === 'number')
                iconElement.style.height = `${height}${unit}`;
        }
        iconElement.setSize = (size = null, unit = 'px') => {
            if (size !== null && typeof size === 'number') {
                iconElement.style.width = `${size}${unit}`;
                iconElement.style.height = `${size}${unit}`;
            }
        } 
        iconElement.setColor = (color) => {
            if (color !== null && typeof color === 'string')
                iconElement.style.color = color;
        }

        // Return the element
        return iconElement;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Menu Bar
    // =======================================>
 
    /**
     * @typedef {Object} UIMenuBarItemBase (Base) Menu Bar Item Element
     * @property {function(string): void} showContextMenu - Show the context menu of the menu bar item (contextMenu)
     */

    /**
     * @typedef {UIElement & UIMenuBarItemBase} UIMenuBarItem Menu Bar Item Element
     */

    /**
     * Creates a menu bar item
     * @param {string} labelText Label text of the menu bar item
     * @param {string} icon Icon of the menu bar item
     * @param {UIContextMenu} contextMenu Context menu of the menu bar item
     * @returns {UIMenuBarItem} Created menu bar item
     */
    menuBarItem(labelText = null, icon = null, contextMenu = null) {
        // Create the element
        const UID = this.UID();
        const menuBarItem = this.element('div', `menuBarItem_${UID}`, 'menuBarItem', null, 'menuBarItem');

        // Add the icon
        if (icon) {
            const menuBarItemIcon = this.icon(icon);
            menuBarItem.add(menuBarItemIcon);
        }

        // Add the label
        if (labelText) {
            const menuBarItemLabel = this.element('div', `menuBarItemLabel_${UID}`, 'menuBarItemLabel', labelText, 'label');
            menuBarItem.add(menuBarItemLabel);
        }

        // Add the context menu (if provided) on click
        if (contextMenu) {
            menuBarItem.listenEvent('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Close other context menus    
                const activeContextMenu = this.body.query(`.${this.#classBase}.contextMenu.show`);
                if (activeContextMenu) {
                    activeContextMenu.hideContextMenu();
                }
                // Get position and show the context menu
                const parentMenuBar = menuBarItem.closest('.menuBarItem');
                contextMenu.showContextMenu(parentMenuBar, 'bottom-left', 'top-left');
            });
        }
        
        return menuBarItem;
    }

    /**
     * @typedef {Object} UIMenuBarBase (Base) Menu Bar Element
     * @property {function(Array<UIMenuBarItem>): void} addItems - Add menu bar items to the menu bar (menuBarItems)
     */

    /**
     * @typedef {UIElement & UIMenuBarBase} UIMenuBar Menu Bar Element
     */

    /**
     * Creates a menu bar
     * @param {Array<UIMenuBarItem>} menuBarItems Menu bar items of the menu bar
     * @returns {UIMenuBar} Created menu bar
     */
    menuBar(menuBarItems = null) {
        // Create the element
        const UID = this.UID();
        const menuBar = this.element('div', `menuBar_${UID}`, 'menuBar', null, 'menuBar');
        
        // External methods
        menuBar.addItems = (menuBarItems) => {
            if (menuBarItems !== null && typeof menuBarItems === 'object')
                menuBar.add(menuBarItems);
        }

        // Add the menu bar items (if provided, after methods defined)
        if (menuBarItems) 
            menuBar.addItems(menuBarItems);

        return menuBar;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Context Menu
    // =======================================>

    /**
     * @typedef {Object} UIContextMenuItemBase (Base) Context Menu Item Element
     * @property {function(string): void} changeIcon - Change the icon of the context menu item (iconName)
     * @property {function(string): void} setLabel - Set the label of the context menu item (labelText)
     * @property {function(string): void} setColor - Set the color of the context menu item (color)
     */
    
    /**
     * @typedef {UIElement & UIContextMenuItemBase} UIContextMenuItem Context Menu Item Element

    /**
     * Creates a context menu item
     * @param {string} labelText Label text of the context menu item
     * @param {string} icon Icon of the context menu item
     * @param {function} onClick Click event of the context menu item
     * @param {boolean} closeOnClick Close the context menu on click
     * @returns {UIMenuBarItem} Created context menu item
     */
    contextMenuItem(labelText = null, icon = null, onClick = null, closeOnClick = true) {
        // Create the element
        const UID = this.UID();
        const contextMenuItem = this.element('div', `contextMenuItem_${UID}`, 'contextMenuItem', null, 'contextMenuItem');
        
        // Add the icon
        if (icon !== null) {
            const contextMenuItemIcon = this.icon(icon);
            contextMenuItem.add(contextMenuItemIcon);
        }
        
        // Add the label
        if (labelText !== null) {
            const contextMenuItemLabel = this.element('div', `contextMenuItemLabel_${UID}`, 'contextMenuItemLabel', labelText, 'label');
            contextMenuItem.add(contextMenuItemLabel);
        }

        // External methods
        contextMenuItem.changeIcon = (iconName) => {
            if (iconName !== null && typeof iconName === 'string') {
                const _icon = contextMenuItem.query('.icon');                
                if (_icon)
                    _icon.changeIcon(iconName);
            }
        }
        contextMenuItem.setLabel = (labelText) => {
            if (labelText !== null && typeof labelText === 'string') {
                const _label = contextMenuItem.query('.contextMenuItemLabel');
                if (_label)
                    _label.innerText = labelText;
            }
        }
        contextMenuItem.setColor = (color) => {
            contextMenuItem.style.color = color;
        }

        // Listeners 
        // Add the on click event (if provided)
        if (onClick) {
            contextMenuItem.onClick = onClick;
            contextMenuItem.listenEvent('click', (e) => {
                e.stopPropagation();
                contextMenuItem.onClick();
                // Close the context menu if the option is set
                if (closeOnClick) 
                    contextMenuItem.closest(".contextMenu").hideContextMenu();
            });
        }
        
        return contextMenuItem;
    }

    /**
     * @typedef {Object} UIContextMenuBase (Base) Context Menu Element
     * @property {function(Array<UIContextMenuItem>): void} addItems - Add context menu items to the context menu (contextMenuItems)
     * @property {function(HTMLElement, string, string, {x: number, y: number}): void} showContextMenu - Show the context menu (referenceElement, refAnchor, targetAnchor, offset)
     * @property {function(): void} hideContextMenu - Hide the context menu 
     */

    /**
     * @typedef {UIElement & UIContextMenuBase} UIContextMenu Context Menu Element
     */

    /**
     * Creates a context menu
     * @param {Array<UIContextMenuItem>} contextMenuItems Context menu items of the context menu
     * @returns {UIContextMenu} Created context menu
     */
    contextMenu(contextMenuItems = null) {
        // Create context menu wrapper (Group all context menus in a single wrapper)
        let contextMenuWrapper = this.body.getByClass('contextMenuWrapper');
        if (!contextMenuWrapper) {
            const _UID = this.UID();
            contextMenuWrapper = this.element('div', `contextMenuWrapper_${_UID}`, 'contextMenuWrapper', null, 'contextMenuWrapper');
            this.body.add(contextMenuWrapper); // DOM Insertion ***
        }

        // Create the element
        const UID = this.UID();
        const contextMenu = this.element('div', `contextMenu_${UID}`, 'contextMenu', null, 'contextMenu');

        // External methods
        contextMenu.addItems = (contextMenuItems) => {
            if (contextMenuItems !== null && contextMenuItems instanceof Array) 
                contextMenu.add(contextMenuItems);
        }
        contextMenu.showContextMenu = (referenceElement, refAnchor = 'bottom-right', targetAnchor = 'top-left', offset = { x: 0, y: 0 }) => {
            // Add the menu to the DOM if it's not already there
            const isIn = contextMenu.isIn(contextMenuWrapper);
            if (!isIn) {
                contextMenuWrapper.add(contextMenu); // DOM Insertion ***
            }
            // Get the final position
            const { x, y } = this.#utils.__getElemPosToDisplay(referenceElement, contextMenu, refAnchor, targetAnchor, offset, 0);
            // Apply final position and show menu    
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            contextMenu.addClass('show');
            contextMenu.removeClass('hidden');
        }
        contextMenu.hideContextMenu = () => {
            contextMenu.removeClass('show');
            contextMenu.addClass('hidden');
        }
        
        // Add the context menu items (if provided, after methods defined)
        if (contextMenuItems !== null) 
            contextMenu.addItems(contextMenuItems);
        
        // Listeners
        // Hide context menu when clicking outside
        this.body.listenEvent('click', () => {
            contextMenu.hideContextMenu();
        });
        return contextMenu;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Status Bar
    // =======================================>
    
    /**
     * @typedef {Object} UIStatusBarItemBase (Base) Status Bar Item Element
     * @property {function(string): void} setLabel - Set the label of the status bar item
     * @property {function(string): void} setColor - Set the color of the status bar item
     * @property {function(string): void} setIcon - Set the icon of the status bar item
     */
    
    /**
     * @typedef {UIElement & UIStatusBarItemBase} UIStatusBarItem Status Bar Item Element
     */

    /**
     * Creates a status bar item
     * @param {string} labelText Label text of the status bar item
     * @param {string} icon Icon of the status bar item
     * @param {function} onClick Click event of the status bar item
     * @returns {UIStatusBarItem} Created status bar item
     */
    statusBarItem(labelText = null, icon = null, onClick = null) {

        // Create the element
        const UID = this.UID();
        const statusBarItem = this.element('div', `statusBarItem_${UID}`, 'statusBarItem', null, 'statusBarItem');
        
        if (icon) {
            const iconElement = this.icon(icon);
            statusBarItem.add(iconElement);
        }
        
        if (labelText) {
            const labelElement = this.element('span', `statusBarItemLabel_${UID}`, 'statusBarItemLabel', labelText, 'label');
            statusBarItem.add(labelElement);
        }

        if (onClick) {
            statusBarItem.listenEvent('click', onClick);
        }

        // External methods
        statusBarItem.setLabel = (labelText) => {
            if (labelText !== null && typeof labelText === 'string') {
                const labelElement = statusBarItem.query('.statusBarItemLabel');
                if (labelElement)
                    labelElement.innerText = labelText;
            }
        }
        statusBarItem.setColor = (color) => {
            statusBarItem.style.color = color;
        }
        statusBarItem.setIcon = (icon) => {
            const iconElement = statusBarItem.query('.icon');
            if (iconElement)
                iconElement.changeIcon(icon);
            else
                statusBarItem.add(this.icon(icon)); // DOM Insertion ***
        }

        return statusBarItem;
    }

    /**
     * @typedef {Object} UIStatusBarBase (Base) Status Bar Element
     * @property {function(Array<UIStatusBarItem>): void} addItems - Add status bar items to the status bar
     * @property {function(string): void} setColor - Set the color of the status bar
     * @property {function(number): void} setHeight - Set the height of the status bar
     * @property {function(): void} show - Show the status bar
     * @property {function(): void} hide - Hide the status bar
     * @property {function(): void} toggle - Toggle the status bar
     */

    /**
     * @typedef {UIElement & UIStatusBarBase} UIStatusBar Status Bar Element
     */

    /**
     * Creates a status bar
     * @param {Array<UIStatusBarItem>} statusBarItems Status bar items of the status bar
     * @returns {UIStatusBar} Created status bar
     */
    statusBar(statusBarItems = null) {
        // Create the element
        const UID = this.UID();
        const statusBar = this.element('div', `statusBar_${UID}`, 'statusBar', null, 'statusBar');

        // External methods
        statusBar.addItems = (statusBarItems) => {
            if (statusBarItems !== null && statusBarItems instanceof Array) 
                statusBar.add(statusBarItems);
        }
        statusBar.setColor = (color) => {
            statusBar.style.backgroundColor = color;
        }
        statusBar.setHeight = (height) => {
            statusBar.style.height = height;
        }
        statusBar.show = () => {
            statusBar.style.display = 'block';
        }
        statusBar.hide = () => {
            statusBar.style.display = 'none';
        }
        statusBar.toggle = () => {
            statusBar.style.display = statusBar.style.display === 'block' ? 'none' : 'block';
        }

        // Add the status bar items (if provided, after methods defined)
        if (statusBarItems !== null) 
            statusBar.addItems(statusBarItems);

        return statusBar;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Tooltip
    // =======================================>

    /**
     * @typedef {Object} UITooltipBase (Base) Tooltip Element
     * @property {function(HTMLElement): void} showTooltip - Show the tooltip (targetElement)
     * @property {function(): void} hideTooltip - Hide the tooltip 
     */

    /**
     * @typedef {UIElement & UITooltipBase} UITooltip Tooltip Element
     */

    /**
     * Create a tooltip for an element (Self-DOM Insertion ***)
     * @param {HTMLElement} targetElement Target element to create the tooltip for
     * @param {string} text Text to display in the tooltip
     * @param {string} position Position of the tooltip (top, bottom, left, right)
     * @returns {UITooltip} Created tooltip element
     */
    tooltip(targetElement, text, position = 'top') {
        // Create tooltip wrapper (Group all tooltips in a single wrapper)
        let tooltipWrapper = this.body.getByClass('tooltipWrapper');
        if (!tooltipWrapper) {
            const _UID = this.UID();
            tooltipWrapper = this.element('div', `tooltipWrapper_${_UID}`, 'tooltipWrapper', null, 'tooltipWrapper');
            this.body.add(tooltipWrapper); // DOM Insertion ***
        }

        // Create tooltip
        const UID = this.UID();
        const tooltip = this.element('div', `tooltip_${UID}`, 'tooltip', text, 'tooltip');

        // External methods
        tooltip.showTooltip = (e) => {
            // Add the tooltip to the DOM if it's not already there
            const isIn = tooltip.isIn(tooltipWrapper);
            if (!isIn) {
                tooltipWrapper.add(tooltip); // DOM Insertion ***
            }
            // Tooltip positions (top, bottom, left, right)
            let refAnchor, targetAnchor, paddingOffset;
            switch (position) {
                case 'top':
                    refAnchor = 'top-center';
                    targetAnchor = 'bottom-center';
                    paddingOffset = { x: 0, y: -8 };
                    break;
                case 'bottom':
                    refAnchor = 'bottom-center';
                    targetAnchor = 'top-center';
                    paddingOffset = { x: 0, y: 8 };
                    break;
                case 'left':
                    refAnchor = 'left-center';
                    targetAnchor = 'right-center';
                    paddingOffset = { x: -8, y: 0 };
                    break;
                case 'right':
                    refAnchor = 'right-center';
                    targetAnchor = 'left-center';
                    paddingOffset = { x: 8, y: 0 };
                    break;
            }
            // Get the final position of the tooltip
            const { x, y, refAnchor: _refAnchor } = this.#utils.__getElemPosToDisplay(targetElement, tooltip, refAnchor, targetAnchor, paddingOffset, 0);
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            const _position = _refAnchor.split("-")[0];
            // Update position class (top, bottom, left, right) needed for the triangle indicator
            tooltip.addClass(`show ${_position}`);
        };
        tooltip.hideTooltip = () => {
            // Remove all position classes (top, bottom, left, right) needed for the triangle indicator
            tooltip.removeClass('show top bottom left right');
        };

        // Listeners
        targetElement.listenEvent('mouseenter', tooltip.showTooltip);
        targetElement.listenEvent('mouseleave', tooltip.hideTooltip);
        return tooltip;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------
    
    // ----------------------------------------
    // #region Floating Panel
    // =======================================>
     
    /**
     * @typedef {Object} FloatingPanelTitleBarBase (Base) Floating Panel Title Bar Element
     * @property {function(string): void} setTitle - Set the title of the floating panel title bar (titleText)
     */

    /**
     * @typedef {UIElement & FloatingPanelTitleBarBase} FloatingPanelTitleBar Floating Panel Title Bar Element
     */

    /**
     * Create a title bar for a floating panel
     * @param {string} titleText Title text of the floating panel title bar
     * @param {FloatingPanel} floatingPanel Floating panel element (Should be the parent of the title bar)
     * @param {boolean} defaultOpen Default open state of the floating panel title bar
     * @returns {FloatingPanelTitleBar} Created floating panel title bar
     */
    floatingPanelTitleBar(titleText = 'Panel', floatingPanel = null, defaultOpen = true) {

        // Create the title bar
        const UID = this.UID();
        const titleBarContainer = this.element('div',`floatingPanelTitleBar_${UID}`, 'floatingPanelTitleBar', null, 'floatingPanelTitleBar');
        const titleBarTitle = this.element('div',`floatingPanelTitleBarTitle_${UID}`, 'floatingPanelTitleBarTitle', titleText, 'label');
        const btnMinimizeMaximize = this.icon('icon-minimize');        
        const btnScale = this.icon('icon-scale');
        const btnStackUnstack = this.icon('icon-stack');
        const btnClose = this.icon('icon-close');
        
        // External methods
        titleBarContainer.setTitle = (titleText) => {
            titleBarTitle.innerText = titleText;
        }

        // Scale Context Menu
        const menuScaleSlider = this.sliderRange('', 75, 100, 1, 100);
        const menuScaleResetBtn = this.button('Reset');
        const contextMenu = this.contextMenu([menuScaleSlider, menuScaleResetBtn]);
        contextMenu.style.padding = '6px';
        // Scale Context Menu Event Listeners
        menuScaleSlider.listenEvent('input', () => {
            const scale = parseInt(menuScaleSlider.getValue()) / 100;
            floatingPanel.scale(scale);
        });
        menuScaleResetBtn.listenEvent('click', () => {
            floatingPanel.scale(1);
        });
        
        // Set initial state
        if (!defaultOpen) {
            floatingPanel.minimize();
            btnMinimizeMaximize.changeIcon('icon-maximize');
        }
        
        // Event listeners (Title Bar)
        btnClose.listenEvent('click', () => {
            floatingPanel.close();
        });
        btnMinimizeMaximize.listenEvent('click', () => {
            if (floatingPanel.isMinimized()) {
                floatingPanel.maximize();
                btnMinimizeMaximize.changeIcon('icon-minimize');
            }
            else {
                floatingPanel.minimize();
                btnMinimizeMaximize.changeIcon('icon-maximize');
            }
        });
        btnScale.listenEvent('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            contextMenu.showContextMenu(btnScale, 'top-right', 'bottom-left', { x: 0, y: -6 });
        });
        btnStackUnstack.listenEvent('click', () => {
            if (floatingPanel.isStacked()) {
                floatingPanel.unstack();
                btnStackUnstack.changeIcon('icon-stack');
            }
            else {
                floatingPanel.stack();
                btnStackUnstack.changeIcon('icon-stack');
            }
        });

        // Add the title bar items
        titleBarContainer.add([titleBarTitle, btnMinimizeMaximize, btnScale, btnStackUnstack, btnClose]);
        return titleBarContainer;
    }

    /**
     * @typedef {Object} FloatingPanelBase (Base) Floating Panel Element
     * @property {function(string): void} add -  Add content to the floating panel *Overwritten (content)
     * @property {function(): void} close - Close the floating panel
     * @property {function(): void} open - Open the floating panel
     * @property {function(): void} minimize - Minimize the floating panel
     * @property {function(): void} maximize - Maximize the floating panel
     * @property {function(): void} stack - Stack the floating panel
     * @property {function(): void} unstack - Unstack the floating panel
     * @property {function(): void} savePosition - Save the position of the floating panel
     * @property {function(): void} restorePosition - Restore the position of the floating panel
     * @property {function(number): void} scale - Scale the floating panel (scale = 1)
     * @property {function(): void} isMinimized - Check if the floating panel is minimized
     * @property {function(): void} isStacked - Check if the floating panel is stacked
     */

    /**
     * @typedef {UIElement & FloatingPanelBase} FloatingPanel Floating Panel Element
     */

    /**
     * Create a floating panel
     * @param {string} titleText Title text of the floating panel title bar
     * @param {number} width Width of the floating panel
     * @param {number} height Height of the floating panel
     * @param {number} positionX Position X of the floating panel
     * @param {number} positionY Position Y of the floating panel
     * @param {boolean} defaultOpen Default open state of the floating panel
     * @returns {FloatingPanel} Created floating panel
     */
    floatingPanel(titleText = 'Panel', width = null, height = null, positionX = null, positionY = null, defaultOpen = true) {
        const UID = this.UID();
        const floatingPanel = this.element('div',`floatingPanel_${UID}`, 'floatingPanel', null, 'floatingPanel');
        const contentWrapper = this.element('div',`floatingPanelContentWrapper_${UID}`, 'floatingPanelContentWrapper', null, 'floatingPanelContentWrapper');
        const titleBar = this.floatingPanelTitleBar(titleText, floatingPanel, defaultOpen);
        floatingPanel.add([titleBar, contentWrapper]);

        // Configurations
        if (width) {
            if (width === 'auto')
                floatingPanel.style.width = 'auto';
            else if (typeof width === 'number')
                floatingPanel.style.width = `${width}px`;
            else if (typeof width === 'string' && (width.includes('%') || width.includes('px') || width.includes('em') || width.includes('rem')))
                floatingPanel.style.width = width;
            else
                floatingPanel.style.width = 'auto';
        }
        if (height) {
            if (height === 'auto')
                floatingPanel.style.height = 'auto';
            else if (typeof height === 'number')
                floatingPanel.style.height = `${height}px`;
            else if (typeof height === 'string' && (height.includes('%') || height.includes('px') || height.includes('em') || height.includes('rem')))
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
            else if (typeof positionX === 'string' && (positionX.includes('%') || positionX.includes('px') || positionX.includes('em') || positionX.includes('rem')))
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
            else if (typeof positionY === 'string' && (positionY.includes('%') || positionY.includes('px') || positionY.includes('em') || positionY.includes('rem')))
                floatingPanel.style.top = positionY;
            else
                floatingPanel.style.top = 'auto';
        }
        
        // External methods
        // Overwrite add method (To allow add content from external sources in the contentWrapper directly)
        floatingPanel.add = (content) => {
            contentWrapper.add(content);
        }
        floatingPanel.close = () => {
            floatingPanel.style.display = 'none';
        }
        floatingPanel.open = () => {
            floatingPanel.style.display = 'block';
        }
        floatingPanel.minimize = () => {
            floatingPanel.addClass('minimized');
        }
        floatingPanel.maximize = () => {
            floatingPanel.removeClass('minimized');
        }
        floatingPanel.stack = (stackPosY = 300, stackPosX = 400, offsetY = 2) => {
            const floatingPanels = this.body.queryAll('.floatingPanel');
            floatingPanels.forEach(panel => {
                panel.scale(1);
                panel.minimize();
                panel.addClass('stacked');
                panel.savePosition();
                panel.style.top = `${stackPosY}px`;
                panel.style.bottom = 'auto';
                panel.style.right = `${stackPosX}px`;
                panel.style.left = 'auto';
                stackPosY += panel.offsetHeight + offsetY;
            });
        }
        floatingPanel.unstack = () => {
            const floatingPanels = this.body.queryAll('.floatingPanel');
            floatingPanels.forEach(panel => {
                panel.scale(1);
                panel.maximize();
                panel.removeClass('stacked');
                panel.restorePosition();
            });
        }
        floatingPanel.savePosition = () => {
            floatingPanel.dataset.posX = floatingPanel.offsetLeft;
            floatingPanel.dataset.posY = floatingPanel.offsetTop;
        }
        floatingPanel.restorePosition = () => {
            floatingPanel.style.left = `${floatingPanel.dataset.posX}px`;
            floatingPanel.style.top = `${floatingPanel.dataset.posY}px`;
            floatingPanel.style.right = 'auto';
            floatingPanel.style.bottom = 'auto';
        }
        floatingPanel.scale = (scale = 1) => {
            floatingPanel.style.transform = `scale(${scale})`;
            floatingPanel.style.transformOrigin = 'top right';
        }
        floatingPanel.isMinimized = () => {
            return floatingPanel.hasClass('minimized');
        }
        floatingPanel.isStacked = () => {
            return floatingPanel.hasClass('stacked');   
        }

        // Add Drag and Resize
        this.setDraggable(floatingPanel, titleBar);
        this.setResizable(floatingPanel);

        return floatingPanel;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Toolbar
    // =======================================>

    /**
     * @typedef {Object} UIToolbarBase ToolbarBase (Base) Toolbar Element
     * @property {function(string): void} changePosition - Change the position of the toolbar (top, bottom, left, right)
     * @property {function(): void} updatePosition - Update the position of the toolbar
     * @property {function(boolean): void} toggle - Toggle the visibility of the toolbar (visible = null)
     * @property {function(): void} show - Show the toolbar
     * @property {function(): void} hide - Hide the toolbar
     */

    /**
     * @typedef {UIElement & UIToolbarBase} UIToolbar Toolbar Element
     */

    /**
     * Create a toolbar
     * @param {string} position Position of the toolbar
     * @param {UIElement} toolbarItems Items to add to the toolbar
     * @returns {UIToolbar} Created toolbar
     */
    toolbar(position = 'top', toolbarItems = null) {

        // Create the toolbar
        const UID = this.UID();
        const toolbar = this.element('div', `toolbar_${UID}`, 'toolbar', null, 'toolbar');
        toolbar.addClass(`toolbar-${position}`);
        if (toolbarItems)
            toolbar.add(toolbarItems);
        
        // External methods
        toolbar.changePosition = (position) => {
            toolbar.removeClass(`toolbar-${position}`);
            toolbar.addClass(`toolbar-${position}`);
            requestAnimationFrame(toolbar.updatePosition);
        }
        toolbar.updatePosition = () => {
            // Get the offsets and adjust the position of the toolbar
            if (position === 'top' || position === 'bottom') {
                toolbar.style.left = `0px`;
                if (position === 'top') {
                    // Get absolute position under menuBar and other top toolbars if they exist
                    let topOffset = this.#toolbarUtils.__getToolbarTopOffset(toolbar); 
                    toolbar.style.top = `${topOffset}px`;
                }
                else if (position === 'bottom') {
                    // Get absolute position over statusBar and other bottom toolbars if they exist
                    let bottomOffset = this.#toolbarUtils.__getToolbarBottomOffset(toolbar); 
                    toolbar.style.bottom = `${bottomOffset}px`;
                }
            }
            else if (position === 'left' || position === 'right') {
                // Get absolute position under menuBar and ALL top toolbars if they exist
                let topOffset = this.#toolbarUtils.__getToolbarTopOffset(); 
                // Get absolute position over statusBar and ALL bottom toolbars if they exist
                let bottomOffset = this.#toolbarUtils.__getToolbarBottomOffset(); 
                // Adjust the height and vertical position of the toolbar
                toolbar.style.top = `${topOffset}px`;
                toolbar.style.height = `calc(100% - ${topOffset + bottomOffset}px)`;
                // Adjust the horizontal position of the toolbar
                if (position === 'left') {
                    // Get absolute position to the left of other left toolbars if they exist
                    let leftOffset = this.#toolbarUtils.__getToolbarLeftOffset(toolbar); 
                    toolbar.style.left = `${leftOffset}px`;
                }
                else if (position === 'right') {
                    // Get absolute position to the right of other right toolbars if they exist
                    let rightOffset = this.#toolbarUtils.__getToolbarRightOffset(toolbar); 
                    toolbar.style.right = `${rightOffset}px`;
                }
            }
        }
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
            requestAnimationFrame(this.#UIUpdaters.__updatePositionToolbars);
            requestAnimationFrame(this.#UIUpdaters.__updatePositionSidePanels);
            requestAnimationFrame(this.#UIUpdaters.__updatePositionWorkspace);
        };
        toolbar.show = () => {
            return toolbar.toggle(true);
        };
        toolbar.hide = () => {
            return toolbar.toggle(false);
        };

        //Event listeners
        window.addEventListener('resize', toolbar.updatePosition);

        // Update the position of the toolbar on load
        requestAnimationFrame(toolbar.updatePosition);
        return toolbar;
    }

    /**
     * @typedef {Object} UIToolbarButtonBase ToolbarButtonBase (Base) Toolbar Button Element
     * @property {function(string): void} changeIcon - Change the icon of the toolbar button (iconName = null)
     * @property {function(string): void} changeTooltip - Change the tooltip of the toolbar button (tooltipText = null)
     */

    /**
     * @typedef {UIElement & UIToolbarButtonBase} UIToolbarButton Toolbar Button Element
     */

    /**
     * Create a toolbar button
     * @param {string} icon Icon name
     * @param {function(): void} onClick Click event handler
     * @param {string} tooltipText Tooltip text
     * @param {string} tooltipPosition Tooltip position
     * @returns {UIToolbarButton} Created toolbar button
     */
    toolbarButton(icon = null, onClick = null, tooltipText = null, tooltipPosition = 'top') {

        // Create the button
        const UID = this.UID();
        const button = this.element('div', `toolbarButton_${UID}`, 'toolbarButton', null, 'toolbarButton');
        
        if (icon) {
            const iconElement = this.icon(icon);
            button.appendChild(iconElement);
        }
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        if (tooltipText) {
            const tooltip = this.tooltip(button, tooltipText, tooltipPosition);
        }

        // External methods
        button.changeIcon = (iconName) => {
            const _icon = button.query('.icon');
            if (_icon) 
                _icon.changeIcon(iconName);
        }
        button.changeTooltip = (tooltipText) => {
            const _tooltip = button.query('.tooltip');
            if (_tooltip) 
                _tooltip.changeTooltip(tooltipText);
        }

        return button;
    }

    /**
     * @typedef {Object} UIToolbarDividerBase ToolbarDividerBase (Base) Toolbar Divider Element
     */

    /**
     * @typedef {UIElement & UIToolbarDividerBase} UIToolbarDivider Toolbar Divider Element
     */

    /**
     * Create a toolbar divider
     * @returns {UIToolbarDivider} Created toolbar divider
     */
    toolbarDivider() {
        // Create divider
        const UID = this.UID();
        const divider = this.element('div', `toolbarDivider_${UID}`, 'toolbarDivider', null, 'toolbarDivider');
        return divider;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------
        
    // ----------------------------------------
    // #region Side Panel
    // =======================================>

    /**
     * @typedef {Object} UISidePanelSectionTitleBarBase SidePanelSectionTitleBarBase (Base) Side Panel Section Title Bar Element
     * @property {function(string): void} setTitle - Set the title of the side panel section title bar (titleText = null)
     */

    /**
     * @typedef {UIElement & UISidePanelSectionTitleBarBase} UISidePanelSectionTitleBar Side Panel Section Title Bar Element
     */

    /**
     * Create a side panel section title bar
     * @param {string} titleText Title text
     * @param {UISidePanelSection} sidePanelSection Side panel section element
     * @param {boolean} defaultOpen Default open state
     * @returns {UISidePanelSectionTitleBar} Created side panel section title bar
     */
    sidePanelSectionTitleBar(titleText = 'Section', sidePanelSection = null, defaultOpen = true) {

        // Create the title bar
        const UID = this.UID();
        const titleBarContainer = this.element('div',`sidePanelSectionTitleBar_${UID}`, 'sidePanelSectionTitleBar', null, 'sidePanelSectionTitleBar');  
        const titleBarTitle = this.element('div',`sidePanelSectionTitleBarTitle_${UID}`, 'sidePanelSectionTitleBarTitle', titleText, 'label');
        const btnMinimize = this.icon('icon-chevron-up');

        // Set the initial state
        if (!defaultOpen)
            btnMinimize.changeIcon('icon-chevron-down');

        // External methods
        titleBarTitle.setTitle = (titleText = null) => {
            if (titleText)
                titleBarTitle.textContent = titleText;
        }
        
        // Event listeners (title bar)
        btnMinimize.listenEvent('click', () => {
            sidePanelSection.toggleClass('minimized');
            if (sidePanelSection.hasClass('minimized'))
                btnMinimize.changeIcon('icon-chevron-down');
            else
                btnMinimize.changeIcon('icon-chevron-up');
        });

        // Add the title bar to the container
        titleBarContainer.add([titleBarTitle, btnMinimize]);
        return titleBarContainer;
    }

    /**
     * @typedef {Object} UISidePanelSectionBase SidePanelSectionBase (Base) Side Panel Section Element
     * @property {function(string): void} setTitle - Set the title of the side panel section (titleText = null)
     * @property {function(UIElement): void} setContent - Set the content of the side panel section (sidePanelItems = null)
     * @property {function(): void} removeContent - Remove the content of the side panel section
     * @property {function(UIElement): void} replaceContent - Replace the content of the side panel section (sidePanelItems = null)
     * @property {function(boolean): void} toggle - Toggle the visibility of the side panel section (visible = null)
     * @property {function(): void} minimize - Minimize the side panel section
     * @property {function(): void} maximize - Maximize the side panel section
     */

    /**
     * @typedef {UIElement & UISidePanelSectionBase} UISidePanelSection Side Panel Section Element
     */

    /**
     * Create a side panel section
     * @param {string} titleText Title text
     * @param {UIElement} sidePanelItems Side panel items
     * @param {boolean} defaultOpen Default open state
     * @returns {UISidePanelSection} Created side panel section
     */
    sidePanelSection(titleText = 'Section', sidePanelItems = null, defaultOpen = true) {
        // Create the side panel section
        const UID = this.UID();
        const sidePanelSection = this.element('div', `sidePanelSection_${UID}`, 'sidePanelSection', null, 'sidePanelSection');
        const titleBar = this.sidePanelSectionTitleBar(titleText, sidePanelSection, defaultOpen);
        const contentWrapper = this.element('div', `sidePanelSectionContentWrapper_${UID}`, 'sidePanelSectionContentWrapper', null, 'contentWrapper');
        
        // External methods
        sidePanelSection.setTitle = (titleText = null) => {
            if (titleText)
                titleBar.setTitle(titleText);
        }
        sidePanelSection.setContent = (sidePanelItems = null) => {
            if (sidePanelItems)
                contentWrapper.add(sidePanelItems);
        }
        sidePanelSection.removeContent = () => {
            contentWrapper.removeAll();
        }
        sidePanelSection.replaceContent = (sidePanelItems = null) => {
            contentWrapper.removeAll();
            if (sidePanelItems)
                contentWrapper.add(sidePanelItems);
        }
        sidePanelSection.toggle = (visible = null) => {
            const show = (visible === null) ? sidePanelSection.hasClass('minimized') : visible;
            if (show) 
                sidePanelSection.removeClass('minimized');
            else 
                sidePanelSection.addClass('minimized');
        }
        sidePanelSection.minimize = () => {
            sidePanelSection.toggle(false);
        }
        sidePanelSection.maximize = () => {
            sidePanelSection.toggle(true);
        }

        // Add content and set the initial state
        if (sidePanelItems)
            sidePanelSection.setContent(sidePanelItems);
        sidePanelSection.toggle(defaultOpen);

        // Add the title bar and content wrapper to the side panel section
        sidePanelSection.add([titleBar, contentWrapper]);
        return sidePanelSection;
    }

    /**
     * @typedef {Object} UISidePanelBase SidePanelBase (Base) Side Panel Element
     * @property {function(): void} updatePosition - Update the position of the side panel
     * @property {function(boolean): void} toggle - Toggle the visibility of the side panel (visible = null)
     * @property {function(): void} show - Show the side panel
     * @property {function(): void} hide - Hide the side panel
     * @property {function(string): void} setWidth - Set the width of the side panel (width = null)
     * @property {function(): string} getWidth - Get the width of the side panel
     * @property {function(string, string): void} addSection - Add a section to the side panel (titleText, sidePanelItems, defaultOpen = true)
     */

    /**
     * @typedef {UIElement & UISidePanelBase} UISidePanel Side Panel Element
     */

    /**
     * Create a side panel
     * @param {string} position Position of the side panel (left, right)
     * @param {string} width Width of the side panel
     * @param {boolean} defaultOpen Default open state
     * @returns {UISidePanel} Created side panel
     */
    sidePanel(position = 'left', width = '280px', defaultOpen = true) {

        // Create the side panel
        const UID = this.UID();
        const sidePanel = this.element('div', `sidePanel_${UID}`, 'sidePanel', null, 'sidePanel');
        sidePanel.addClass(`sidePanel-${position}`);
        
        // External methods
        sidePanel.updatePosition = () => {
            // Get the offsets and adjust the position of the sidePanel
            let topOffset = this.#toolbarUtils.__getToolbarTopOffset();
            let bottomOffset = this.#toolbarUtils.__getToolbarBottomOffset();
            // Adjust the height and vertical position of the sidePanel
            sidePanel.style.top = `${topOffset}px`;
            sidePanel.style.height = `calc(100% - ${topOffset + bottomOffset}px)`;
            // Adjust the horizontal position of the sidePanel
            if (position === 'left') {
                const leftOffset = this.#toolbarUtils.__getToolbarLeftOffset();
                sidePanel.style.left = `${leftOffset}px`;
            } else if (position === 'right') {
                const rightOffset = this.#toolbarUtils.__getToolbarRightOffset();
                sidePanel.style.right = `${rightOffset}px`;
            }
        };
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
                    let leftOffset = this.#toolbarUtils.__getToolbarLeftOffset();
                    sidePanel.style.left = `${leftOffset}px`;
                } else if (position === 'right') {
                    let rightOffset = this.#toolbarUtils.__getToolbarRightOffset();
                    sidePanel.style.right = `${rightOffset}px`;     
                }
            } else {
                // Hide the sidePanel
                sidePanel._width = sidePanel.style.width; // Save the current width
                sidePanel.addClass('sidePanel-hidden');
                sidePanel.style.width = '0px';
                sidePanel.style.overflow = 'hidden';
            }
            requestAnimationFrame(this.#UIUpdaters.__updatePositionToolbars);
            requestAnimationFrame(this.#UIUpdaters.__updatePositionSidePanels);
            requestAnimationFrame(this.#UIUpdaters.__updatePositionWorkspace);
        };        
        sidePanel.show = () => {
            return sidePanel.toggle(true);
        };
        sidePanel.hide = () => {
            return sidePanel.toggle(false);
        };
        sidePanel.setWidth = (width = null) => {
            // Set the width and save the original width to restore it later (when hiding the sidePanel)
            if (width) {
                if (width.includes('px') || width.includes('%') || width.includes('em') || width.includes('rem') || width.includes('vh') || width.includes('vw'))
                    sidePanel.style.width = width;
                else
                    sidePanel.style.width = `${width}px`;
                sidePanel._width = sidePanel.style.width;
            }                
        }
        sidePanel.getWidth = () => {
            return sidePanel._width;
        }
        sidePanel.addSection = (titleText, sidePanelItems, defaultOpen = true) => {
            const section = this.sidePanelSection(titleText, sidePanelItems, defaultOpen);
            sidePanel.add(section);
            return section;
        };

        // Event Listeners
        window.addEventListener('resize', sidePanel.updatePosition);

        // Set initial state
        sidePanel.setWidth(width);
        sidePanel.toggle(defaultOpen);
        requestAnimationFrame(sidePanel.updatePosition);

        // Return the sidePanel
        return sidePanel;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------
    
    // ----------------------------------------
    // #region Workspace
    // =======================================>

    /**
     * @typedef {Object} UIWorkspaceBase WorkspaceBase (Base) Workspace Element
     * @property {function(): void} updatePosition - Update the position of the workspace
     * @property {function(): number} getWidth - Get the width of the workspace
     * @property {function(): number} getHeight - Get the height of the workspace
     * @property {function(UIElement): void} setContent - Set the content of the workspace (content = null)
     * @property {function(): void} adjustCanvasSize - Adjust the size of the canvas
     * @property {function(): void} setCanvas - Set the canvas of the workspace (autoResize = true)
     * @property {function(): HTMLCanvasElement} getCanvas - Get the canvas of the workspace
     * @property {function(string): void} setBackgroundColor - Set the background color of the workspace (backgroundColor = null)
     * @property {function(string): void} setBackgroundImage - Set the background image of the workspace (backgroundImage = null)
     */

    /**
     * @typedef {UIElement & UIWorkspaceBase} UIWorkspace Workspace Element
     */

    /**
     * Create a workspace
     * @param {UIElement} content Content of the workspace
     * @param {string} backgroundColor Background color of the workspace
     * @param {string} backgroundImage Background image of the workspace
     * @returns {UIWorkspace} Created workspace
     */
    workspace(content = null, backgroundColor = null, backgroundImage = null) {

        // Create the workspace
        const UID = this.UID();
        const workspace = this.element('div', `workspace_${UID}`, 'workspace', null, 'workspace');
        let _width = 0;
        let _height = 0;
        let _canvas = null;
        
        // External methods
        workspace.updatePosition = () => {
             // Get the offsets of the toolbars
             let topOffset = this.#toolbarUtils.__getToolbarTopOffset();
             let bottomOffset = this.#toolbarUtils.__getToolbarBottomOffset();
             let leftOffset = this.#toolbarUtils.__getToolbarLeftOffset();
             let rightOffset = this.#toolbarUtils.__getToolbarRightOffset();
             // Get the offsets of the side panels
             const leftSidePanel = this.body.query(`.${this.#classBase}.sidePanel.sidePanel-left:not(.sidePanel-hidden)`);
             const rightSidePanel = this.body.query(`.${this.#classBase}.sidePanel.sidePanel-right:not(.sidePanel-hidden)`);
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
            _height =  (document.documentElement.clientHeight - topOffset - bottomOffset);
            // Adjust the workspace width and horizontal position
            workspace.style.left = `${leftOffset}px`;
            workspace.style.right = `${rightOffset}px`;
            workspace.style.width = `calc(100% - ${leftOffset + rightOffset}px)`; 
            _width = (document.documentElement.clientWidth - leftOffset - rightOffset);
            // Adjust the canvas size if it exists
            if (_canvas)
                workspace.adjustCanvasSize();
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
        workspace.setContent = (content = null) => {
            if (content) {
                workspace.removeAll();
                workspace.add(content);
            }
        }
        workspace.adjustCanvasSize = () => {
           if (_canvas) {
                // Create a temporary canvas to store the original image
                let __tmpCanvas = document.createElement('canvas');
                let __tmpCtx = __tmpCanvas.getContext('2d');
                __tmpCanvas.width = _canvas.width;
                __tmpCanvas.height = _canvas.height;
                __tmpCtx.drawImage(_canvas, 0, 0);
                // Resize the canvas to the new dimensions
                _canvas.width  = _width; //workspace.getWidth(); // Get instant width
                _canvas.height = _height; //workspace.getHeight(); // Get instant height
                // Restore the original image
                const ctx = _canvas.getContext('2d');
                ctx.clearRect(0, 0, _canvas.width, _canvas.height);
                ctx.drawImage(__tmpCanvas, 0, 0);
                // Remove the temporary canvas
                __tmpCanvas.remove();
            }
        }
        workspace.setCanvas = () => {
            workspace.updatePosition();
            _canvas = document.createElement('canvas');
            _canvas.style.width ='100%';
            _canvas.style.height='100%';        
            _canvas.width = _width;
            _canvas.height = _height; 
            workspace.setContent(_canvas);
            return _canvas;
        }
        workspace.getCanvas = () => {
            return _canvas;
        }
        workspace.setBackgroundImage = (backgroundImage = null) => {
            if (backgroundImage)
                workspace.style.backgroundImage = `url("${backgroundImage}")`;
        }
        workspace.setBackgroundColor = (backgroundColor = null) => {
            if (backgroundColor)
                workspace.style.backgroundColor = backgroundColor;
        }
        
        // Event Listeners
        window.addEventListener('resize', () => {
            workspace.updatePosition();
        });

        // Set initial state
        workspace.setBackgroundColor(backgroundColor);
        workspace.setBackgroundImage(backgroundImage);
        workspace.setContent(content);
        requestAnimationFrame(workspace.updatePosition);

        return workspace;
    }

    // <=======================================
    // #endregion
    // ----------------------------------------
    
    // ----------------------------------------
    // #region Basic Controls (separator, button, switch, textInput, dropdown)
    // =======================================>

     /**
      * @typedef {Object} UISeparatorBase SeparatorBase (Base) Separator Element    
      * @property {function(string): void} setColor - Set the color of the separator (color = null)
      * @property {function(string): void} setLabel - Set the label of the separator (labelText = null)
      * @property {function(): void} removeLabel - Remove the label of the separator
      */

     /**
      * @typedef {UIElement & UISeparatorBase} UISeparator Separator Element
      */

     /**
      * Create a separator
      * @param {string} labelText Label of the separator
      * @param {string} color Color of the separator
      * @returns {UISeparator} Created separator
      */
    separator(labelText = null, color = null) {

        // Create the separator
        const UID = this.UID();
        const separator = this.element('div', `separator_${UID}`, 'separator', null, 'separator');
        
        // External methods
        separator.setColor = (color = null) => {
            if (color)
                separator.style.setProperty('--separator-color', color);
        }
        separator.setLabel = (labelText = null) => {
            if (labelText) {
                let titleSpan = separator.query('.separator-title');
                separator.classList.add('separator-with-title');
                if (titleSpan) {
                    titleSpan.innerHTML = labelText;
                } else {
                    titleSpan = this.element('span', `separatorTitle_${UID}`, 'separator-title', labelText, 'separator-title');
                    separator.appendChild(titleSpan);
                }
            }
        }
        separator.removeLabel = () => {
            let titleSpan = separator.query('.separator-title');
            if (titleSpan) {
                titleSpan.remove();
                separator.classList.remove('separator-with-title');
            }
        }

        // Set initial state
        separator.setColor(color);
        separator.setLabel(labelText);

        return separator;
    }

    /**
     * @typedef {Object} UIButtonBase ButtonBase (Base) Button Element  
     * @property {function(string): void} setLabel - Set the label of the button (labelText = null)
     * @property {function(string): void} setBackgroundColor - Set the background color of the button (bgColor = null)
     * @property {function(string): void} setBackgroundColorHover - Set the background color of the button when hovered (bgColorHover = null)
     */

    /**
     * @typedef {UIElement & UIButtonBase} UIButton Button Element         
     */

    /**
     * Create a button
     * @param {string} labelText Label of the button
     * @param {string} bgColor Background color of the button
     * @param {string} bgColorHover Background color of the button when hovered
     * @returns {UIButton} Created button
     */
    button(labelText = 'Button', bgColor = null, bgColorHover = null) {
        
        // Create the button
        const UID = this.UID();
        const button = this.element('div', `btn_${UID}`, 'button', labelText, 'button');
        let _bgColor = bgColor;
        let _bgColorHover = bgColorHover;

        // External methods
        button.setLabel = (labelText = null) => {
            if (labelText)
                button.innerHTML = labelText;
        }
        button.setBackgroundColor = (bgColor = null) => {
            if (bgColor) {
                button.style.background = bgColor;
                _bgColor = bgColor;
            }
        }
        button.setBackgroundColorHover = (bgColorHover = null) => {
            if (bgColorHover) {
                _bgColorHover = bgColorHover;
            }
        }

        // Event Listeners       
        button.listenEvent('mouseenter', () => {
            if (_bgColorHover)
                button.style.background = _bgColorHover;
        });
        button.listenEvent('mouseleave', () => {
            if (_bgColor)
                button.style.background = _bgColor;
        });
        
        // Set initial state
        button.setLabel(labelText);
        button.setBackgroundColor(_bgColor);
        button.setBackgroundColorHover(_bgColorHover);

        return button;
    }

    /** 
     * @typedef {Object} UISwitchBase SwitchBase (Base) Switch Element
     * @property {function(string): void} setLabel - Set the label of the switch (labelText = null)
     * @property {function(): boolean} getValue - Get the value of the switch
     * @property {function(boolean): void} setValue - Set the value of the switch (value = null)
     * @property {function(): void} updateColor - Update the color of the switch
     * @property {function(string): void} setColorActive - Set the color of the switch when active (colorActive = null)
     * @property {function(string): void} setColorInactive - Set the color of the switch when inactive (colorInactive = null)
     */

    /**
     * @typedef {UIElement & UISwitchBase} UISwitch Switch Element
     */

    /**
     * Create a switch
     * @param {string} labelText Label of the switch
     * @param {string} colorActive Color of the switch when active
     * @param {string} colorInactive Color of the switch when inactive
     */
    switch(labelText = 'Switch', colorActive = null, colorInactive = null) {

        // Create the switch
        const UID = this.UID();
        const container = this.element('div', `switchContainer_${UID}`, 'controlContainer', null, 'controlContainer');
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper', null, 'switch');
        const switchControl = this.element('label', `switchGroup_${UID}`, 'switchGroup', null, 'switch');
        const switchInput = this.element('input', `switchInput_${UID}`, 'switchInput', null, 'switch');
        const switchSlider = this.element('span', `switchSlider_${UID}`, 'switchSlider', null, 'switch');
        switchInput.type = 'checkbox';
        switchControl.add([switchInput, switchSlider]);
        controlWrapper.add(switchControl);
        container.add(controlWrapper);

        let _colorActive = colorActive;
        let _colorInactive = colorInactive;

        // External methods
        container.setLabel = (labelText = null) => {
            if (labelText) {
                let label = container.query('.label');
                if (label)
                    label.innerHTML = labelText;
                else {
                    label = this.element('div', `label_${UID}`, 'label', labelText, 'label');
                    container.prepend(label);
                }
            }
        }
        container.getValue = () => {
            return switchInput.checked;
        }
        container.setValue = (value = null) => {
            if (value)
                switchInput.checked = value;
        }
        container.updateColor = () => {
            if (_colorActive && switchInput.checked)
                switchSlider.style.backgroundColor = _colorActive;
            else if (!switchInput.checked)
                switchSlider.style.backgroundColor = _colorInactive || '';
        }
        container.setColorActive = (colorActive = null) => {
            if (colorActive) {
                _colorActive = colorActive;
                container.updateColor();
            }
        }
        container.setColorInactive = (colorInactive = null) => {
            if (colorInactive) {
                _colorInactive = colorInactive;
                container.updateColor();
            }
        }

        // Event Listeners
        switchInput.addEventListener('change', () => {
            container.updateColor();
        });
        // Add event listener from external source
        container.addEvent = (eventType, functionCallback) => {
            switchInput.addEventListener(eventType, functionCallback);
        }

        // Set initial state
        container.setLabel(labelText);
        container.setColorActive(colorActive);
        container.setColorInactive(colorInactive);

        // Return the container
        return container;
    }
    
    /**
     * @typedef {Object} UITextInputBase TextInputBase (Base) Text Input Element
     * @property {function(string): void} setType - Set the type of the text input (type = null, text, password, number, email, etc.)
     * @property {function(boolean): void} setReadOnly - Set the read only of the text input (readOnly = null)
     * @property {function(boolean): void} setDisabled - Set the disabled of the text input (disabled = null)
     * @property {function(number): void} setMaxLength - Set the max length of the text input (maxLength = null)
     * @property {function(number): void} setMinLength - Set the min length of the text input (minLength = null)
     * @property {function(string): void} setLabel - Set the label of the text input (labelText = null)
     * @property {function(string): void} setPlaceholder - Set the placeholder of the text input (placeholder = null)
     * @property {function(string): void} setValue - Set the value of the text input (value = null)
     * @property {function(): string} getValue - Get the value of the text input
     */

    /**
     * @typedef {UIElement & UITextInputBase} UITextInput Text Input Element
     */

    /**
     * Create a text input
     * @param {string} labelText Label of the text input
     * @param {string} placeholder Placeholder of the text input
     * @param {string} defaultValue Default value of the text input
     * @returns {UITextInput} Created text input
     */
    textInput(labelText = 'Text Input', placeholder = '', defaultValue = '') {
        const UID = this.UID();
        const container = this.element('div', `textInputContainer_${UID}`, 'controlContainer', null, 'controlContainer');
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper', null, 'textInput');
        const textInput = this.element('input', `textInput_${UID}`, 'textInput');

        controlWrapper.add(textInput);
        container.add(controlWrapper);

        // External methods
        container.setType = (type = null) => {
            if (type)
                textInput.type = type;
        }
        container.setReadOnly = (readOnly = null) => {
            if (readOnly)
                textInput.readOnly = readOnly;
        }
        container.setDisabled = (disabled = null) => {
            if (disabled)
                textInput.disabled = disabled;
        }
        container.setMaxLength = (maxLength = null) => {
            if (maxLength)
                textInput.maxLength = maxLength;
        }
        container.setMinLength = (minLength = null) => {
            if (minLength)
                textInput.minLength = minLength;
        }
        container.setLabel = (labelText = null) => {
            if (labelText) {
                let label = container.query('.label');
                if (label)
                    label.innerHTML = labelText;
                else {
                    label = this.element('div', `label_${UID}`, 'label', labelText, 'label');
                    container.prepend(label);
                }
            }
        }
        container.setPlaceholder = (placeholder = null) => {
            if (placeholder)
                textInput.placeholder = placeholder;
        }
        container.setValue = (value = null) => {
            if (value)
                textInput.value = value;
        }
        container.getValue = () => {
            return textInput.value;
        }

        // Event Listeners
        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            textInput.addEventListener(eventType, functionCallback);
        }
        
        // Set initial state
        container.setType('text');
        container.setLabel(labelText);
        container.setPlaceholder(placeholder);
        container.setValue(defaultValue);

        // Return the container
        return container;
    }

    /**
     * @typedef {Object} UIDropdownBase DropdownBase (Base) Dropdown Element
     * @property {function(string): void} setLabel - Set the label of the dropdown (labelText = null)
     * @property {function(): string} getValue - Get the value of the dropdown
     * @property {function(string): void} setValue - Set the value of the dropdown (value = null)
     * @property {function(array): void} setOptions - Set the options of the dropdown (options = null)
     * @property {function(string): void} setDefaultOption - Set the default option of the dropdown (defaultOption = null)
     */

    /**
     * @typedef {UIElement & UIDropdownBase} UIDropdown Dropdown Element
     */

    /**
     * Create a dropdown
     * @param {string} labelText Label of the dropdown
     * @param {array} options Options of the dropdown
     * @param {string} defaultOption Default option of the dropdown
     * @returns {UIDropdown} Created dropdown
     */
    dropdown(labelText = 'Dropdown', options = [], defaultOption = null) {

        // Create the dropdown
        const UID = this.UID();
        const container = this.element('div', `dropdownContainer_${UID}`, 'controlContainer', null, 'controlContainer');
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper', null, 'dropdown');
        const select = this.element('select', `dropdown_${UID}`, 'dropdown', null, 'dropdown');
        let _defaultOption = defaultOption;
        controlWrapper.add(select);
        container.add(controlWrapper);

        // External methods
        container.setLabel = (labelText = null) => {
            if (labelText) {
                let label = container.query('.label');
                if (label)
                    label.innerHTML = labelText;
                else {
                    label = this.element('div', `label_${UID}`, 'label', labelText, 'label');
                    container.prepend(label);
                }
            }
        }
        container.getValue = () => {
            return select.value;
        }
        container.setValue = (value = null) => {
            if (value)
                select.value = value;
        }
        container.setOptions = (options = null) => {
            if (options) {
                select.removeAll();
                options.forEach((option, index) => {
                    let optionElement = this.element('option', `option_${index}_${UID}`, 'option', option.label);
                    optionElement.setAttribute('index', index);
                    optionElement.setAttribute('value', option.value);
                    optionElement.value = option.value;
                    if (_defaultOption && option.value === _defaultOption)
                        optionElement.selected = true;
                    select.add(optionElement);
                });
            }
        }
        container.setDefaultOption = (defaultOption = null) => {
            if (defaultOption) {
                _defaultOption = defaultOption;
            }
        }

        // Event Listeners
        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            select.addEventListener(eventType, functionCallback);
        }
        
        // Set initial state
        container.setLabel(labelText);
        container.setDefaultOption(defaultOption);
        container.setOptions(options);
  
        // Return the container
        return container;
    }

    // <======================================= 
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Advanced Controls 1 (checkboxGroup, colorPicker, sliderRange, sliderStepper, sliderInterval)
    // =======================================>

    /**
     * @typedef {Object} UICheckboxGroupBase CheckboxGroupBase (Base) Checkbox Group Element
     * @property {function(string): void} setLabel - Set the label of the checkbox group (labelText = null)
     * @property {function(): array} getValue - Get the value of the checkbox group
     * @property {function(array): void} setValue - Set the value of the checkbox group (value = null) 
     * @property {function(array): void} setOptions - Set the options of the checkbox group (options = null)
     */

    /**
     * @typedef {UIElement & UICheckboxGroupBase} UICheckboxGroup Checkbox Group Element
     */

    /**
     * Create a checkbox group
     * @param {string} labelText Label of the checkbox group
     * @param {array} options Options of the checkbox group
     * @returns {UICheckboxGroup} Created checkbox group
     */
    checkboxGroup = (labelText = null, options = []) => {
        
        // Create the checkbox group
        const UID = this.UID();
        const container = this.element('div', `checkboxGroupContainer_${UID}`, 'controlContainer', null, 'controlContainer');
        const label = this.element('div', `label_${UID}`, 'label', labelText, 'label');
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper', null, 'checkboxGroup');
        const checkboxGroup = this.element('div', `checkboxGroup_${UID}`, 'checkboxGroup', null, 'checkboxGroup');
        
        controlWrapper.add(checkboxGroup);
        container.add(controlWrapper);

        // External methods
        container.setLabel = (labelText = null) => {
            if (labelText) {
                let label = container.query('.label');
                if (label)
                    label.innerHTML = labelText;
                else {
                    label = this.element('div', `label_${UID}`, 'label', labelText, 'label');
                    container.prepend(label);
                }
            }
        }
        container.getValue = () => {
            return checkboxGroup.querySelectorAll('input[type="checkbox"]:checked').map(checkbox => checkbox.value);
        }
        container.setValue = (value = null) => {
            if (value)
                checkboxGroup.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = value.includes(checkbox.value));
        }
        container.setOptions = (options = null) => {
            if (options) {
                checkboxGroup.removeAll();
                options.forEach(option => {
                    const checkboxContainer = this.element('div', `checkboxContainer_${UID}`, 'checkboxContainer');
                    const checkbox = this.element('input', `checkbox_${option.value}_${UID}`, 'checkbox');
                    const checkboxLabel = this.element('label', null, 'checkboxLabel', option.label);
                    checkbox.type = 'checkbox';
                    checkbox.checked = option.checked || false;
                    checkboxContainer.add([checkbox, checkboxLabel]);   
                    checkboxGroup.add(checkboxContainer);
                });
            }
        }

        // Event Listeners
        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            checkboxGroup.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.addEventListener(eventType, functionCallback));
        }

        // Set initial state
        container.setLabel(labelText);
        container.setOptions(options);

        return container;
    }

    /**
     * @typedef {Object} UIColorPickerBase ColorPickerBase (Base) Color Picker Element
     * @property {function(string): void} setLabel - Set the label of the color picker (labelText = null)
     * @property {function(string): void} setValue - Set the value of the color picker (value = null) 
     * @property {function(): string} getValue - Get the value of the color picker
     * @property {function(): void} updateColorValueDisplay - Update the color value display
     */

    /**
     * @typedef {UIElement & UIColorPickerBase} UIColorPicker Color Picker Element
     */

    /**
     * Create a color picker
     * @param {string} labelText Label of the color picker
     * @param {string} defaultColor Default color of the color picker
     * @returns {UIColorPicker} Created color picker
     */
    colorPicker = (labelText = 'Color Picker', defaultColor = '#000000') => {

        // Create the color picker
        const UID = this.UID();
        const container = this.element('div', `colorPickerContainer_${UID}`, 'controlContainer', null, 'controlContainer');
        const controlWrapper = this.element('div', `controlWrapper_${UID}`, 'controlWrapper', null, 'controlWrapper');

        const colorPicker = this.element('input', `colorPicker_${UID}`, 'colorPicker', null, 'colorPicker');
        const valueContainer = this.element('div', `valueContainer_${UID}`, 'colorValueContainer', null, 'colorPicker');
        const valueDisplay = this.element('input', `colorValue_${UID}`, 'colorValue', null, 'colorPicker');
        const formatToggle = this.element('button', `formatToggle_${UID}`, 'colorFormatToggle', 'HEX', null, 'colorPicker');

        colorPicker.type = 'color';
        valueDisplay.type = 'text';
        valueDisplay.readOnly = true;

        valueContainer.add([valueDisplay, formatToggle]);
        controlWrapper.add([colorPicker, valueContainer]);
        container.add(controlWrapper);        
 
        let _currentFormat = 'hex';
        let _currentColor = defaultColor;

        // External methods
        container.setLabel = (labelText = null) => {
            if (labelText) {
                let label = container.query('.label');
                if (label)
                    label.innerHTML = labelText;
                else {
                    label = this.element('div', `label_${UID}`, 'label', labelText, 'label');
                    container.prepend(label);
                }
            }
        }
        container.setValue = (value = null) => {
            if (value) {
                _currentColor = value;
                colorPicker.value = value;
                valueDisplay.value = value;
            }
        }
        container.getValue = () => {
            return _currentColor;
        }
        container.updateColorValueDisplay = () => {
            const hex = colorPicker.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            
            switch(_currentFormat) {
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
        colorPicker.addEventListener('input', container.updateColorValueDisplay);        
        formatToggle.addEventListener('click', () => {
            switch(_currentFormat) {
                case 'hex':
                    _currentFormat = 'rgb';
                    formatToggle.textContent = 'RGB';
                    break;
                case 'rgb':
                    _currentFormat = 'hsl';
                    formatToggle.textContent = 'HSL';
                    break;
                case 'hsl':
                    _currentFormat = 'hex';
                    formatToggle.textContent = 'HEX';
                    break;
            }
            container.updateColorValueDisplay();
        });
        // Add event listener from external source and get the value
        container.addEvent = (eventType, functionCallback) => {
            colorPicker.addEventListener(eventType, functionCallback);
        }
        
        // Set initial value
        container.setValue(defaultColor);
        container.updateColorValueDisplay();
        container.setLabel(labelText);

        // Return the container
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

    // <======================================= 
    // #endregion
    // ----------------------------------------












    // ----------------------------------------
    // #region Advanced Controls 2
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

    // <======================================= 
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Advanced Containers
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

    // <======================================= 
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Faceplate
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
    
    // <======================================= 
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region Draggable and Resizable
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

    // <======================================= 
    // #endregion
    // ----------------------------------------

    // ----------------------------------------
    // #region WIP
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

    messageBox = (title = 'Message Box', content = null, buttons = [], blurBackground = true) => {
        const UID = this.UID();
        
        // Create messageBox wrapper if needed
        let messageBoxWrapper = this.query('.messageBoxWrapper');
        if (!messageBoxWrapper) {
            messageBoxWrapper = this.element('div', `messageBoxWrapper_${UID}`, 'messageBoxWrapper');
            this.add(messageBoxWrapper);
        }

        // Create or get overlay
        let overlay = messageBoxWrapper.query('.overlay');
        if (blurBackground) {
            if (!overlay) {
                overlay = this.element('div', `overlay_${UID}`, 'overlay');
                messageBoxWrapper.add(overlay);
            }
        }

        // Create messageBox
        const messageBox = this.element('div', `messageBox_${UID}`, 'messageBox');

        // Create title bar
        const titleBar = this.element('div', `messageBoxTitleBar_${UID}`, 'messageBoxTitleBar');
        const titleText = this.element('div', `messageBoxTitle_${UID}`, 'messageBoxTitle', title);
        const closeButton = this.element('div', `messageBoxCloseButton_${UID}`, 'messageBoxCloseButton');
        closeButton.add(this.icon('icon-close'));
        titleBar.add([titleText, closeButton]);
        messageBox.add(titleBar);


        
        closeButton.onclick = () => {
            messageBox.hide();
            if (overlay) overlay.addClass('overlay-hidden');
        };


        // Create content area
        const contentArea = this.element('div', `messageBoxContent_${UID}`, 'messageBoxContent');
        if (content) {
            contentArea.add(content);
            messageBox.add(contentArea);
        }

        // Create footer with buttons
        const footer = this.element('div', `messageBoxFooter_${UID}`, 'messageBoxFooter');
        if (Array.isArray(buttons)) {
            buttons.forEach(button => {
                const btn = this.element('button', `messageBoxButton_${UID}`, 'messageBoxButton');
                btn.textContent = button.text;
                btn.onclick = () => {
                    if (button.action) button.action();
                    messageBox.remove();
                    if (overlay) overlay.remove();
                };
                footer.add(btn);
            });
        } else if (buttons) {
            const btn = this.element('button', `messageBoxButton_${UID}`, 'messageBoxButton');
            btn.textContent = buttons.text;
            btn.onclick = () => {
                if (buttons.action) buttons.action();
                messageBox.remove();
                if (overlay) overlay.remove();
            };
            footer.add(btn);
        }
        messageBox.add(footer);

        messageBoxWrapper.add(messageBox);


        messageBox.show = () => {
            messageBoxWrapper.removeClass('messageBoxWrapper-hidden');
        }

        messageBox.hide = () => {
            messageBoxWrapper.addClass('messageBoxWrapper-hidden');
        }







        return messageBox;
    }

    alertBox = (title = 'Alert', message = 'Alert Message', icon = 'icon-robot', onOk = null, onCancel = null) => {
        const alertContent = this.element('div', `alertBoxContent_${this.UID()}`, 'alertBoxContent');
        
        // Create icon container
        const iconContainer = this.element('div', `alertBoxIcon_${this.UID()}`, 'alertBoxIcon');
        const iconElement = this.icon(icon);
        iconElement.setSize(64, 64);
        iconContainer.add(iconElement);
        alertContent.add(iconContainer);

        // Create message container
        const messageContainer = this.element('div', `alertBoxMessage_${this.UID()}`, 'alertBoxMessage');
        messageContainer.textContent = message;
        alertContent.add(messageContainer);

        // Create buttons
        const buttons = [
            { text: 'Cancel', action: onCancel },
            { text: 'OK', action: onOk }
        ];

        return this.messageBox(title, alertContent, buttons, true);
    }

    // <======================================= 
    // #endregion
    // ----------------------------------------


}


/***
 * 
 * To Do:
 * - Change the icon size in the alert message box
 * - Context Menu multiple 
 * - Context Menu submenu
 * - Context Menu right click
 * - Context Menu keyboard shortcuts
 * - Control the progress bar
 * - Big button with icon and text
 * - Add a toast notification
 * - Check add Event Listeners in all elements
 * - You were adding wrappers: for tooltip, for context menu, for messageBox & alertBox
 * - Some elements will be added to the body automatically: tooltip, context menu, messageBox & alertBox
 *   
*/