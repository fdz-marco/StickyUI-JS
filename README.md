# StickyUI.js

A lightweight JavaScript library for creating dynamic, draggable UI elements and controls for web applications. Particularly useful for canvas-based applications or HMIs (Human Machine Interfaces).

<img src="https://raw.github.com/fdz-marco/StickyUI-JS/master/demo.png" width="350" />

## Features

- Draggable and resizable panels
- Rich set of UI controls (buttons, sliders, color pickers, etc.)
- Dark mode support
- Customizable styling
- No dependencies

## Installation

1. Include the CSS file in your HTML:
```html
<link rel="stylesheet" href="StickyUI.css">
```

2. Include the JavaScript file:
```html
<script src="StickyUI.js"></script>
```

## Basic Usage

Initialize the library:
```javascript
const ui = new StickyUI();
```

Create a panel with controls:
```javascript
// Create a panel
const panel = ui.panel('My Panel');

// Add a button
const button = ui.button('Click me');
panel.addContent(button);

// Add the panel to the document
document.body.appendChild(panel);
```

## Components

### Main Containers

#### Panel
Creates a draggable and resizable panel with a title bar.

```javascript
const panel = ui.panel('Panel Title', '300px', '400px', '50px', '50px');
```

Parameters:
- titleText (string): Panel title
- width (string): Initial width
- height (string): Initial height
- positionX (string): Initial X position
- positionY (string): Initial Y position

#### Menu Bar
Creates a horizontal menu bar.

```javascript
const menuBar = ui.menuBar();
const button = ui.barButton();
menuBar.appendChild(button);
```

### Basic Controls

#### Button
```javascript
const button = ui.button('Click Me', '#2196F3', '#1976D2');
```

Parameters:
- labelText (string): Button text
- bgColor (string): Background color
- bgColorHover (string): Hover background color

#### Switch
```javascript
const switch = ui.switch('Toggle', '#2196F3', '#ccc');
```

Parameters:
- labelText (string): Switch label
- colorActive (string): Active state color
- colorInactive (string): Inactive state color

#### Text Input
```javascript
const input = ui.textInput('Name', 'Enter your name', 'Default');
```

Parameters:
- labelText (string): Input label
- placeholder (string): Placeholder text
- defaultValue (string): Initial value

#### Dropdown
```javascript
const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
];
const dropdown = ui.dropdown('Select', options, 'option1');
```

### Advanced Controls

#### Color Picker
```javascript
const colorPicker = ui.colorPicker('Choose Color', '#FF0000');
```

#### Slider Range
```javascript
const slider = ui.sliderRange('Volume', 0, 100, 1, 50);
```

Parameters:
- labelText (string): Slider label
- min (number): Minimum value
- max (number): Maximum value
- step (number): Step increment
- defaultValue (number): Initial value

#### Slider Interval
```javascript
const intervalSlider = ui.sliderInterval('Range', 0, 100, 1, 25, 75);
```

#### Checkbox Group
```javascript
const options = [
    { value: 'opt1', label: 'Option 1', checked: true },
    { value: 'opt2', label: 'Option 2', checked: false }
];
const checkboxGroup = ui.checkboxGroup('Select Options', options);
```

### Advanced Containers

#### Folder
Creates a collapsible container for grouping controls.

```javascript
const controls = [ui.button('Button 1'), ui.switch('Switch 1')];
const folder = ui.folder('Settings', 'icon-folder-close', 'icon-folder-open', '#2196F3', '#1976D2', false, controls);
```

#### Tabs
Creates a tabbed interface for organizing controls.

```javascript
const tab1Controls = [ui.button('Tab 1 Button')];
const tab2Controls = [ui.switch('Tab 2 Switch')];

const tab1 = ui.tabPage('General', 'icon-settings', tab1Controls);
const tab2 = ui.tabPage('Advanced', 'icon-tools', tab2Controls);

const tabs = ui.tabs([tab1, tab2], 0);
```

## Styling

The library includes a comprehensive CSS file with variables for customizing the appearance. You can override these variables in your own CSS:

```css
:root {
    --primary-color: #2196F3;
    --bg-color: #ffffff;
    --text-color: #333;
    /* ... other variables ... */
}
```

## Dark Mode

Dark mode is automatically supported through CSS media queries. You can customize the dark mode colors by modifying the variables in the dark mode section of the CSS file.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License

## Author

Marco Fernandez
Website: marcofdz.com