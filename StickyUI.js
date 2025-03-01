/*
/* ------------------------------------------------------------------------------
/* ClassName: Sticky UI JS
/* Description: A simple class to create user interfaces over the browser DOM
/* specially useful for canvas-based applications or HMIs.
/* Author: Marco Fernandez (marcofdz.com)
/* Version: 1.0.1
/* License: MIT
/* Repository: https://github.com/fdz-marco/StickyUI-JS
/* File: StickyUI.js
/* ------------------------------------------------------------------------------
*/

class StickyUI {

    // ----------------------------------------
    // Constructor
    // ----------------------------------------

    constructor() {
        // Inject styles to the head (Not used, prefer to use the css file)
        //this.addStyles();
    }

    // ----------------------------------------
    // Basic methods
    // ----------------------------------------
    
    // Create an element 
    element = (type, id = null, className = null, content = null) => {
        let element = document.createElement(type);
        if (id !== null) 
            element.id = id;
        if (className !== null) {
            if(typeof className === 'string')
                element.className += className;
            if(typeof className === 'array') 
                className.forEach(name => { element.classList.add(name); });
        }
        if (content !== null && typeof content === 'string')
            element.innerHTML = content;
        if (content !== null && typeof content === 'object')
            element.appendChild(content);
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
    // Context Menu & Menu Bar
    // ----------------------------------------
 
    // Context Menu 
    contextMenuItem = (labelText = null, icon = null, onClick = null) => {
        const UID = this.UID();
        const contextMenuItem = this.element('div', `contextMenuItem_${UID}`, 'contextMenuItem');
        const contextMenuItemLabel = this.element('div', `contextMenuItemLabel_${UID}`, 'contextMenuItemLabel', labelText);
        
        if (icon) {
            const contextMenuItemIconContainer = this.element('div', `contextMenuItemIconContainer_${UID}`, 'contextMenuItemIconContainer');
            const contextMenuItemIcon = this.element('div', `contextMenuItemIcon_${UID}`, `icon ${icon}`);
            contextMenuItemIconContainer.appendChild(contextMenuItemIcon);
            contextMenuItem.appendChild(contextMenuItemIconContainer);
        }
        
        contextMenuItem.appendChild(contextMenuItemLabel);

        if (onClick) {
            contextMenuItem.onClick = onClick;
            contextMenuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenuItem.onClick();
                contextMenuItem.closest(".contextMenu").hideContextMenu();
            });
        }
        
        return contextMenuItem;
    }

    contextMenu = (contextMenuItems) => {
        const UID = this.UID();
        const contextMenu = this.element('div', `contextMenu_${this.UID()}`, 'contextMenu');
        
        contextMenuItems.forEach(item => {
            contextMenu.appendChild(item);
        });

        // Methods to show and hide the context menu externally
        contextMenu.showContextMenu = (x, y) => {
            const menuRect = contextMenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
        
            if (x + menuRect.width > viewportWidth) {
                x = viewportWidth - menuRect.width;
            }
            
            if (y + menuRect.height > viewportHeight) {
                y = y - menuRect.height;
            }
        
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            contextMenu.classList.add('show');
        }

        contextMenu.hideContextMenu = () => {
            contextMenu.classList.remove('show');
        }
        
        return contextMenu;
    }

    // Menu Bar
    menuBarItem = (labelText = null, icon = null, contextMenu = null) => {
        const UID = this.UID();
        const menuBarItem = this.element('div', `menuBarItem_${UID}`, 'menuBarItem');
        const menuBarItemLabel = this.element('div', `menuBarItemLabel_${UID}`, 'menuBarItemLabel', labelText);
        
        if (icon) {
            const menuBarItemIconContainer = this.element('div', `menuBarItemIconContainer_${UID}`, 'menuBarItemIconContainer');
            const menuBarItemIcon = this.element('div', `menuBarItemIcon_${UID}`, `icon ${icon}`);
            menuBarItemIconContainer.appendChild(menuBarItemIcon);
            menuBarItem.appendChild(menuBarItemIconContainer);
        }

        menuBarItem.appendChild(menuBarItemLabel);
        
        if (contextMenu) {
            menuBarItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const activeContextMenu = document.querySelector('.contextMenu.show');
                if (activeContextMenu) {
                    activeContextMenu.hideContextMenu();
                }
                const rect = menuBarItem.getBoundingClientRect();
                const menuBarItemPadding = menuBarItem.style.padding;
                const parentPadding = menuBarItem.parentElement.style.paddingBottom;
                const x = rect.left;
                const y = rect.bottom + parentPadding + menuBarItemPadding;
                contextMenu.showContextMenu(x, y);
            });
            document.body.appendChild(contextMenu);
        }
        return menuBarItem;
    }

    menuBar = (menuBarItems) => {
        const UID = this.UID();
        const menuBar = this.element('div', `menuBar_${UID}`, 'menuBar');

        // Add menu items to the menu bar
        menuBarItems.forEach(item => {
            menuBar.appendChild(item);
        });

        // Hide context menu when clicking outside
        document.addEventListener('click', () => {
            const activeContextMenu = document.querySelector('.contextMenu.show');
            if (activeContextMenu) {
                activeContextMenu.hideContextMenu();
            }
        });

        return menuBar;
    }

    // ----------------------------------------
    // Status Bar
    // ----------------------------------------
    
    statusBar = () => {
        const container = this.element('div', null, 'statusBar');
        return container;
    }

    statusBarItem = (text = '', icon = null) => {
        const container = this.element('div', null, 'statusBarItem');
        
        if (icon) {
            const iconElement = this.element('div', null, 'icon');
            iconElement.classList.add(icon);
            container.appendChild(iconElement);
        }
        
        if (text) {
            const textElement = this.element('span', null, null, text);
            container.appendChild(textElement);
        }
        
        return container;
    }

    // ----------------------------------------
    // Tooltip
    // ----------------------------------------

    tooltip = (element, text, position = 'top') => {
        const tooltip = this.element('div', null, 'tooltip', text);

        const showTooltip = (e) => {
            tooltip.classList.add('show');
            
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
            tooltip.className = `tooltip show ${preferredPosition}`;
        };

        const hideTooltip = () => {
            tooltip.classList.remove('show');
        };

        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        
        return tooltip;
    }

    // ----------------------------------------
    // Main Containers
    // ----------------------------------------
        
    // Panel Title Bar
    panelTitleBar = (titleText = 'Panel') => {
        const UID = this.UID();
        const titleBarContainer = this.element('div',`titleBarContainer_${UID}`, 'titleBarContainer');
        const titleBarTitle = this.element('div',`titleBarTitle_${UID}`, 'titleBarTitle', titleText);
        const btnMinimize = this.element('div',`btnMinimize_${UID}`, 'titleBarButton', `<div class="icon icon-minimize"></div>`);
        const btnMaximize = this.element('div',`btnMaximize_${UID}`, 'titleBarButton', `<div class="icon icon-maximize"></div>`);
        const btnScale = this.element('div',`btnScale_${UID}`, 'titleBarButton', `<div class="icon icon-scale"></div>`);
        const btnStack = this.element('div',`btnStack_${UID}`, 'titleBarButton', `<div class="icon icon-stack"></div>`);
        const btnClose = this.element('div',`btnClose_${UID}`, 'titleBarButton', `<div class="icon icon-close"></div>`);

        titleBarContainer.appendChild(titleBarTitle);
        titleBarContainer.appendChild(btnMinimize);
        titleBarContainer.appendChild(btnMaximize);
        titleBarContainer.appendChild(btnScale);
        titleBarContainer.appendChild(btnStack);
        titleBarContainer.appendChild(btnClose);

        return titleBarContainer;
    }

    // Panel
    panel = (titleText = 'Panel', width = null, height = null, positionX = null, positionY = null) => {
        const UID = this.UID();
        const panel = this.element('div',`panel_${UID}`, 'panel');
        const titleBar = this.panelTitleBar(titleText);
        const content = this.element('div',`panelContent_${UID}`, 'panelContent');

        panel.appendChild(titleBar);
        panel.appendChild(content);

        // Configurations
        if (width)      panel.style.width = `${width}px`;
        if (height)     panel.style.height = `${height}px`;
        if (positionX > 0)  panel.style.left = `${positionX}px`;
        if (positionY > 0)  panel.style.top = `${positionY}px`;      
        if (positionX < 0)  panel.style.right = `${positionX*-1}px`;
        if (positionY < 0)  panel.style.bottom = `${positionY*-1}px`;

        // Method to add content externally
        panel.addContent = (element) => {
            content.appendChild(element);
        };

        // Buttons actions
        const btnMinimize = titleBar.querySelector('.icon-minimize').parentElement;
        const btnMaximize = titleBar.querySelector('.icon-maximize').parentElement;
        const btnScale = titleBar.querySelector('.icon-scale').parentElement;
        const btnStack = titleBar.querySelector('.icon-stack').parentElement;
        const btnClose = titleBar.querySelector('.icon-close').parentElement;
        btnMaximize.style.display = 'none';

        btnMinimize.addEventListener('click', () => {
            content.style.display = 'none';
            btnMinimize.style.display = 'none';
            btnMaximize.style.display = 'block';
            panel.classList.add('minimized');
        });

        btnMaximize.addEventListener('click', () => {
            content.style.display = 'block';
            btnMaximize.style.display = 'none';
            btnMinimize.style.display = 'block';
            panel.classList.remove('minimized');
        });

        let isScaled = false;
        btnScale.addEventListener('click', () => {
            isScaled = !isScaled;
            panel.style.transform = isScaled ? 'scale(0.5)' : 'scale(1)';
            panel.style.transformOrigin = 'top right';
            btnScale.classList.toggle('active');
        });

        // Add Drag and Resize
        this.setDraggable(panel, titleBar);
        this.setResizable(panel);

        return panel;
    }

    // Icon Bars
    iconBarHorizontal = () => this.element('div','iconBarHorizontal_' + this.UID(), 'iconBarHorizontal');
    iconBarButton = () => this.element('div','iconBarButton_' + this.UID(), 'iconBarButton');

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
        const container = this.element('div', `vector2Container_${UID}`, 'controlContainer');
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
                element.style.width = `${Math.max(200, width)}px`;
                element.style.height = `${Math.max(100, height)}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    // Inject styles to the head (Not used, prefer to use the css file)
    /*addStyles = () => {
        var styles = ``;
        var styleSheet = document.createElement("style")
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    }*/

}