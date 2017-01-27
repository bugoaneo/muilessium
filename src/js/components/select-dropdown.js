import * as Utils from '../utils';
import * as Keyboard from '../controls/keyboard';
import { Component } from '../component';


export class SelectDropdown extends Component {
    constructor(element, options) {
        super(element, options);

        this.dom = Utils.extend(this.dom, {
            labels:      this.element.parentNode.getElementsByTagName('label'),
            select:      this.element.getElementsByClassName('select')[0],
            state:       this.element.getElementsByClassName('state')[0],
            options:     this.element.getElementsByClassName('mui-dropdown-options')[0],
            optionsList: this.element.getElementsByClassName('option'),
            shadow:      this.element.getElementsByClassName('mui-shadow-toggle')[0],
            icon:        this.element.getElementsByClassName('icon')[0]
        });

        this.state = Utils.extend(this.state, {
            selectedIndex: this.getSelectedIndex(),
            isOpened: false
        });

        this.createHiddenSelect();
        this.initAria();
        this.initControls();
        this.updateState();
    }


    createHiddenSelect() {
        let hiddenSelect = document.createElement('select'),
            id = this.dom.select.getAttribute('data-id');

        hiddenSelect.setAttribute('id', id);
        hiddenSelect.setAttribute('name', id);

        this.element.appendChild(hiddenSelect);
        this.dom.hiddenSelect = hiddenSelect;

        Utils.addClass(this.dom.hiddenSelect, '_hidden');
        Utils.aria.set(this.dom.hiddenSelect, 'hidden', true);

        [].forEach.call(this.dom.optionsList, (option) => {
            let hiddenOption = document.createElement('option');

            hiddenOption.value = Utils.getAttribute(option, 'data-value');
            
            this.dom.hiddenSelect.add(hiddenOption);
        });

        return this;
    }


    initAria() {
        Utils.aria.setRole(this.dom.select, 'listbox');

        [].forEach.call(this.dom.optionsList, (option) => {
            Utils.aria.setRole(option, 'option');
            Utils.aria.setId(option);
        });

        Utils.aria.set(this.dom.select, 'activedescendant',
                    this.dom.optionsList[this.state.selectedIndex].getAttribute('id'));
        Utils.aria.set(this.dom.state, 'hidden', true);
        Utils.aria.set(this.dom.icon, 'hidden', true);
        Utils.aria.set(this.dom.shadow, 'hidden', true);

        Utils.ifNodeList(this.dom.labels, () => {
            const selectId = Utils.aria.setId(this.dom.select);

            [].forEach.call(this.dom.labels, (label) => {
                Utils.setAttribute(label, 'for', selectId);
            });

            Utils.aria.set(this.dom.select, 'labelledby', Utils.aria.setId(this.dom.labels[0]));
        });

        return this;
    }

    
    initControls() { 
        Utils.makeElementClickable(this.dom.select, this.toggleDropdown.bind(this));
        Utils.makeElementClickable(this.dom.shadow, this.toggleDropdown.bind(this), true);

        Utils.makeChildElementsClickable(this.element, this.dom.optionsList, (index) => {
            this.updateState(index);
            this.closeDropdown();
        });

        Utils.ifNodeList(this.dom.labels, () => {
            [].forEach.call(this.dom.labels, (label) => {
                label.addEventListener('focus', () => {
                    this.dom.select.focus();
                });
            });

            this.dom.select.addEventListener('focus', () => {
                Utils.makeElementsNotFocusable(this.dom.labels);
            });

            this.dom.select.addEventListener('blur', () => {
                Utils.makeElementsFocusable(this.dom.labels);
            });
            
        });

        Keyboard.onTabPressed(Utils.lastOfList(this.dom.optionsList), () => {
            this.closeDropdown();

            Utils.goToNextFocusableElement(this.dom.shadow);
        });

        return this;
    }


    getSelectedIndex() {
        for (let i = 0; i < this.dom.options.length; i++) {
            if (Utils.hasClass(this.dom.options[i], '-selected')) {
                return i;
            }
        }

        return 0;
    }

    openDropdown() {
        this.state.isOpened = true;

        Utils.addClass(this.element, '-opened');
        Utils.addClass(this.dom.shadow, '-visible');

        return this;
    }

    toggleDropdown() {
        this.state.isOpened = !this.state.isOpened;

        Utils.toggleClass(this.element, '-opened');
        Utils.toggleClass(this.dom.shadow, '-visible');

        return this;
    }


    closeDropdown() {
        this.state.isOpened = false;

        Utils.removeClass(this.element, '-opened');
        Utils.removeClass(this.dom.shadow, '-visible');

        return this;
    }


    updateState(newSelectedIndex = 0) {
        this.state.selectedIndex = newSelectedIndex;
        this.dom.state.innerHTML = this.dom.optionsList[this.state.selectedIndex].innerHTML;
        this.dom.hiddenSelect.selectedIndex = this.state.selectedIndex.toString();

        Utils.aria.set(this.dom.select, 'activedescendant',
                    this.dom.optionsList[this.state.selectedIndex].getAttribute('id'));

        return this;
    }
};

