/*
/* ------------------------------------------------------------------------------
/* ClassName: Sticky UI JS
/* Description: A simple class to create user interfaces over the browser DOM
/* specially useful for canvas-based applications or HMIs.
/* Author: Marco Fernandez (marcofdz.com)
/* Version: 1.0.0
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
        if (width)      panel.style.width = width;
        if (height)     panel.style.height = height;
        if (positionX)  panel.style.right = positionX;
        if (positionY)  panel.style.top = positionY;

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
        this.setResize(panel);

        return panel;
    }

    // Horizontal Menu Bar (WIP)
    menuBar = () => this.element('div','menuBar_' + this.UID(), 'menuBar');
    barButton = () => this.element('div','barButton_' + this.UID(), 'barButton');

    // ----------------------------------------
    // Basic Controls
    // ----------------------------------------

    separator = (titleText = null, color = null) => {
        const UID = this.UID();
        const separator = this.element('div', `separator_${UID}`, 'separator');
        
        // Configurations
        if (titleText) {
            separator.classList.add('separator-with-title');
            const titleSpan = this.element('span', `separatorTitle_${UID}`, 'separator-title', titleText);
            separator.appendChild(titleSpan);
        }
        if (color)
            separator.style.setProperty('--separator-color', color);
        
        return separator;
    }

    button = (labelText = 'Button', bgColor = null, bgColorHover = null) => {
        const UID = this.UID();
        const button = this.element('div', `btn_${UID}`, 'button');
        button.innerHTML = labelText;
        
        // Configurations
        if (bgColor)
            button.style.background = bgColor;
        if (bgColorHover) {
            button.addEventListener('mouseenter', () => {
                button.style.background = bgColorHover;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = bgColor || ''; 
            });
        }
        return button;
    }

    switch = (labelText = 'Switch', colorActive = null, colorInactive = null) => {
        const UID = this.UID();
        const switchContainer = this.element('div', `switchContainer_${UID}`, 'switchContainer');
        const switchLabel = this.element('div', `switchLabel_${UID}`, 'switchLabel', labelText);
        const switchControlWrapper = this.element('div', `switchControlWrapper_${UID}`, 'controlWrapper');
        const switchControl = this.element('label', `switchControl_${UID}`, null);
        const switchInput = this.element('input', `switchInput_${UID}`, 'switchInput');
        const switchSlider = this.element('span', `switchSlider_${UID}`, 'switchSlider');
        switchInput.type = 'checkbox';

        switchControl.appendChild(switchInput);
        switchControl.appendChild(switchSlider);
        switchControlWrapper.appendChild(switchControl);
        switchContainer.appendChild(switchLabel);
        switchContainer.appendChild(switchControlWrapper);

        // Configurations
        if (colorInactive) 
            switchSlider.style.backgroundColor = colorInactive;
        if (colorActive)
            switchInput.addEventListener('change', () => {
                switchSlider.style.backgroundColor = switchInput.checked ? colorActive : (colorInactive || '');
            });

        return switchContainer;
    }
    
    textInput = (labelText = 'Text Input', placeholder = '', defaultValue = '') => {
        const UID = this.UID();
        const textInput = this.element('div', `inputContainer_${UID}`, 'inputContainer');
        
        // Configurations
        if (labelText) {
            const labelElement = this.element('label', `inputLabel_${UID}`, 'inputLabel', labelText);
            textInput.appendChild(labelElement);
        }

        // Text Input Control Wrapper
        const textInputControlWrapper = this.element('div', `textInputControlWrapper_${UID}`, 'controlWrapper');
        const input = this.element('input', `input_${UID}`, 'textInput');
        input.type = 'text';
        input.placeholder = placeholder;
        input.value = defaultValue;
        
        textInputControlWrapper.appendChild(input);
        textInput.appendChild(textInputControlWrapper);
        return textInput;
    }

    dropdown = (labelText  = 'Dropdown', options = [], defaultOption = null) => {
        const UID = this.UID();
        const dropdown = this.element('div', `dropdownContainer_${UID}`, 'dropdownContainer');
        
        // Configurations
        if (labelText) {
            const labelElement = this.element('label', `dropdownLabel_${UID}`, 'dropdownLabel', labelText);
            dropdown.appendChild(labelElement);
        }

        // Dropdown Control Wrapper
        const dropdownControlWrapper = this.element('div', `dropdownControlWrapper_${UID}`, 'controlWrapper');
        const select = this.element('select', `dropdown_${UID}`, 'dropdown');
        options.forEach(option => {
            let optionElement = this.element('option', null, null, option.label);
            optionElement.value = option.value;
            if (defaultOption && option.value === defaultOption) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });
        
        dropdownControlWrapper.appendChild(select);
        dropdown.appendChild(dropdownControlWrapper);
        return dropdown;
    }

    // ----------------------------------------
    // Advanced Controls
    // ----------------------------------------

    checkboxGroup = (labelText = null, options) => {
        const UID = this.UID();
        const checkboxGroup = this.element('div', `checkboxGroup_${UID}`, 'checkboxGroup');
        
        if (labelText) {
            const groupLabel = this.element('label', `checkboxGroupLabel_${UID}`, 'checkboxGroupLabel', labelText);
            checkboxGroup.appendChild(groupLabel);
        }

        const checkBoxControlWrapper = this.element('div', `checkboxGroupControlWrapper_${UID}`, 'controlWrapper');
        options.forEach(option => {
            const checkboxContainer = this.element('div', `checkboxContainer_${UID}`, 'checkboxContainer');
            const checkbox = this.element('input', `checkbox_${UID}_${option.value}`, 'checkbox');
            const checkboxLabel = this.element('label', null, 'checkboxLabel', option.label);
            checkbox.type = 'checkbox';
            checkbox.checked = option.checked || false;
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            checkBoxControlWrapper.appendChild(checkboxContainer);
        });

        checkboxGroup.appendChild(checkBoxControlWrapper);
        return checkboxGroup;
    }

    colorPicker = (labelText = 'Color Picker', defaultColor = '#000000') => {
        const UID = this.UID();
        const colorPicker = this.element('div', `colorContainer_${UID}`, 'colorContainer');
        
        // Configurations
        if (labelText) {
            const labelElement = this.element('label', `colorLabel_${UID}`, 'colorLabel', labelText);
            colorPicker.appendChild(labelElement);
        }

        // Color Picker Control Wrapper
        const colorPickerControlWrapper = this.element('div', `colorPickerControlWrapper_${UID}`, 'controlWrapper');
        const colorInput = this.element('input', `colorPicker_${UID}`, 'colorPicker');
        const valueContainer = this.element('div', `valueContainer_${UID}`, 'colorValueContainer');
        const valueDisplay = this.element('input', `colorValue_${UID}`, 'colorValue');
        const formatToggle = this.element('button', `formatToggle_${UID}`, 'colorFormatToggle', 'HEX');
        colorInput.type = 'color';
        colorInput.value = defaultColor;        
        valueDisplay.type = 'text';
        valueDisplay.readOnly = true;
        valueDisplay.value = defaultColor;

        let currentFormat = 'hex';
        
        // Function to convert color to different formats
        const updateColorValue = () => {
            const hex = colorInput.value;
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
        colorInput.addEventListener('input', updateColorValue);
        
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

        valueContainer.appendChild(valueDisplay);
        valueContainer.appendChild(formatToggle);
        colorPickerControlWrapper.appendChild(colorInput);
        colorPickerControlWrapper.appendChild(valueContainer);
        colorPicker.appendChild(colorPickerControlWrapper);
        
        return colorPicker;
    }

    sliderRange = (labelText = 'Slider Range', min = 0, max = 100, step = 1, defaultValue = 0) => {
        const UID = this.UID();
        const sliderRange = this.element('div', `sliderContainer_${UID}`, 'sliderContainer');
        
        // Configurations
        if (labelText) {
            const labelElement = this.element('label', `sliderLabel_${UID}`, 'sliderLabel', labelText);
            sliderRange.appendChild(labelElement);
        }

        const sliderControlWrapper = this.element('div', `sliderControlWrapper_${UID}`, 'controlWrapper');
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

        sliderControlWrapper.appendChild(sliderInput);
        sliderControlWrapper.appendChild(sliderValueDisplay);
        sliderRange.appendChild(sliderControlWrapper);
        return sliderRange;
    }

    sliderStepper = (labelText = 'Slider Stepper', min = 0, max = 100, step = 1, defaultValue = 0) => {
        const UID = this.UID();
        const sliderStepper = this.element('div', `sliderContainer_${UID}`, 'sliderContainer');
        
        // Configurations
        if (labelText) {
            const labelElement = this.element('label', `sliderLabel_${UID}`, 'sliderLabel', labelText);
            sliderStepper.appendChild(labelElement);
        }

        const sliderControlWrapper = this.element('div', `sliderControlWrapper_${UID}`, 'controlWrapper');
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

        sliderControlWrapper.appendChild(decrementBtn);
        sliderControlWrapper.appendChild(sliderInput);
        sliderControlWrapper.appendChild(incrementBtn);
        sliderControlWrapper.appendChild(sliderValueDisplay);
        
        sliderStepper.appendChild(sliderControlWrapper);
        return sliderStepper;
    }

    sliderInterval = (labelText = 'Slider Interval', min = 0, max = 100, step = 1, defaultValue = 25, defaultValueEnd = 75) => {
        const UID = this.UID();
        const sliderInterval = this.element('div', `sliderContainer_${UID}`, 'sliderContainer');
        
        // Configurations
        if (labelText) {
            const labelElement = this.element('label', `sliderLabel_${UID}`, 'sliderLabel', labelText);
            sliderInterval.appendChild(labelElement);
        }

        const sliderControlWrapper = this.element('div', `sliderControlWrapper_${UID}`, 'controlWrapper');
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


        sliderContainer.appendChild(sliderStart);
        sliderContainer.appendChild(sliderEnd);
        sliderControlWrapper.appendChild(valueDisplayStart);
        sliderControlWrapper.appendChild(sliderContainer);
        sliderControlWrapper.appendChild(valueDisplayEnd);
        sliderInterval.appendChild(sliderControlWrapper);

        return sliderInterval;
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

        // Configurations
        if (bgColor) {
            folderHeader.style.backgroundColor = bgColor;
        }
        if (bgColorHover) {
            folderHeader.dataset.hoverColor = bgColorHover;
            folderHeader.addEventListener('mouseenter', e => e.target.style.backgroundColor = bgColorHover);
            folderHeader.addEventListener('mouseleave', e => e.target.style.backgroundColor = bgColor || '');
        }

        folderHeader.appendChild(folderIcon);
        folderHeader.appendChild(folderTitle);
        folderHeader.appendChild(folderToggleButton);

        // Default Status
        if (defaultClosed) {
            contentContainer.classList.add('collapsed');
            folderToggleButton.innerHTML = '<div class="icon icon-chevron-up"></div>';
            folderIcon.innerHTML = (iconClose) ? `<div class="icon ${iconClose}"></div>` : (iconClose !== false) ?'<div class="icon icon-folder-close"></div>' : '';
        } else {
            folderToggleButton.innerHTML = '<div class="icon icon-chevron-down"></div>';
            folderIcon.innerHTML = (iconOpen) ? `<div class="icon ${iconOpen}"></div>` : (iconOpen !== false) ?'<div class="icon icon-folder-open"></div>' : '';
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
    // Draggable and Resizable
    // ----------------------------------------

    // Draggable
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

    // Resize
    setResize = (element) => {
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