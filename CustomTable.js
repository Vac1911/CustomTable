import { html, css, LitElement } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { live } from 'lit/directives/live.js';
import { templateContent } from 'lit/directives/template-content.js';
import { sortBy, gt, eq, lt, isUndefined } from 'lodash';
import { SelectMany } from './SelectMany';

const mode = (arr) => {
    const fMap = new Map();
    let maxFreq = 0;
    let mode;
    for (const item of arr) {
        let freq = fMap.has(item) ? fMap.get(item) : 0;
        freq++;
        if (freq > maxFreq) {
            maxFreq = freq;
            mode = item;
        }
        fMap.set(item, freq);
    }
    return mode;
}

const sortInsensitive = arr => {
    return arr.sort((a, b) => {
        var comparison = a.toLowerCase().localeCompare(b.toLowerCase());
        if (comparison === 0) return a.localeCompare(b);
        return comparison;
    });
}

export class CustomTable extends LitElement {
    static get styles() {
        return css`
        :host {
            display: block;
            color: #262626;
        }
        table {
            width: 100%;
            color: inherit;
            vertical-align: top;
            border-color: #dee2e6;
            clear: both;
            margin-top: 6px !important;
            margin-bottom: 6px !important;
            max-width: none !important;
            border-collapse: separate !important;
            border-spacing: 0;
            caption-side: bottom;
        }
        thead, tbody, tfoot, tr, td, th {
            border-color: inherit;
            border-style: solid;
            border-width: 0;
        }
        table > thead {
            vertical-align: bottom;
        }
        table > tbody {
            vertical-align: inherit;
        }
        td, th {
            padding: 0.25rem 0.25rem;
            background-color: var(--bs-table-bg);
            border-bottom-width: 1px;
            box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg);
        }
        thead > tr:last-child > th {
            position: relative;
            border-bottom-color: currentColor;
        }
        thead input, thead select {
            width: 100%;
            cursor: pointer;
            box-sizing: border-box;
        }
        .hidden {
            visibility: hidden;
        }
    `;
    }

    static get properties() {
        return {
            _rowTemplate: {},
            _records: { type: Array },
            endpoint: { type: String },
            page: { type: Number },
            pageSize: { type: Number },
            sortProp: { type: String },
            sortDir: { type: Number },
            selectMax: { type: Number },
            filter: {},
        }
    }

    get table() {
        return this.shadowRoot.getElmentById('managedTable');
    }

    get colgroupTemplate() {
        return this._findSlottedTemplate('colgroup');
    }

    constructor() {
        super();
        this._rowTemplate = '';
        this._records = [];
        this.columns = [];
        this.sortProp = null;
        this.sortDir = 0;
        this.filter = {};
        this.page = 0;
        this.pageSize = 15;
        this.selectMax = 50;
    }

    refresh() {
        this.fetchRecords();
    }

    async fetchRecords() {
        fetch(this.endpoint)
            .then(res => res.json())
            .then(data => {
                this._records = data;
                this.requestUpdate();
            });
    }

    async parseTemplate() {
        const row = this._findSlottedTemplate('row');
        const head = this._findSlottedTemplate('thead');
        if (this.__dom_loading_count > 10)
            throw new Error('Could not load template content');
        if (row && head) {
            this._rowTemplate = row.innerHTML.replaceAll(/\$\{/gm, '${this.');
            this.columns = Array.from(head.content.querySelectorAll('th')).map(th => ({
                label: th.innerText,
                propName: th.getAttribute('data-prop'),
                type: th.getAttribute('data-type') ?? null,
                search: th.getAttribute('data-search') ?? null,
            }));
        }
        else {
            this.__dom_loading_count ||= 0;
            this.__dom_loading_count++;
            await new Promise(resolve => setTimeout(resolve, 100));
            this.parseTemplate();
        }
    }

    firstUpdated() {
        this.fetchRecords();
        this.parseTemplate();
    }


    _findSlottedTemplate(slotName) {
        const slot = this.shadowRoot.querySelector(`slot[name="${slotName}"]`);
        if (slot)
            return slot.assignedElements()[0];
    }

    /**
     * Apply filtering, sorting, and pagination to the list of records.
     *
     * @param boolean paginated - disable to get a count of the current number of visible records
     * @returns array
     */
    getRecords(paginated = true) {
        let recordArr = [...this._records];

        // Apply Filtering
        for (let [key, value] of Object.entries(this.filter)) {
            const column = this.columns.find(c => c.propName == key);
            if (column.search == 'select') {
                if (column.type == 'number')
                    value = parseInt(value);
                recordArr = recordArr.filter(r => this.getValue(r, key) === value);
            }
            else if (column.search == 'text') {
                if (column.type == 'string') {
                    recordArr = recordArr.filter(r => this.getValue(r, key) && this.getValue(r, key).match(new RegExp(value, "gi")));
                }
                else if (column.type == 'number') {
                    let otherNumber = Number.parseInt(value.match(/(\d)+/));
                    let operator = eq;
                    if (value.match(/^<\d/))
                        operator = lt;
                    else if (value.match(/^>\d/))
                        operator = gt;
                    recordArr = recordArr.filter(r => operator(this.getValue(r, key), otherNumber) && this.getValue(r, key) !== null);
                }
            }
        }

        // Apply Sorting
        if (this.sortProp && this.sortDir !== 0) {
            recordArr = sortBy(recordArr, r => this.getValue(r, this.sortProp));
            if (this.sortDir == -1) {
                recordArr = recordArr.reverse();
            }
        }

        // Apply Pagination
        if (paginated) recordArr = recordArr.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize);

        return recordArr;
    }

    /**
     * Navigate to first page
     */
    firstPage() {
        this.page = 0;
    }

    /**
     * Navigate to previous page
     */
    prevPage() {
        this.page = Math.max(this.page - 1, 0);
    }

    /**
     * Navigate to next page
     */
    nextPage() {
        this.page = Math.min(this.page + 1, this.pageCount - 1);
    }

    /**
     * Navigate to last page
     */
    lastPage() {
        this.page = this.pageCount - 1;
    }

    /**
     * Get the total number of pages
     *
     * @returns Number - total number of pages
     */
    get pageCount() {
        return Math.ceil(this.getRecords(false).length / this.pageSize);
    }

    /**
     * Evaluate a row template in the context of a record
     *
     * @param string str - row template to evaluate
     * @param object record - record to use as context
     * @param string nullReplace - what should null be replaced wtih
     * @return TemplateResult - the evauluaed row template
     */
    interpolate(str, record, nullReplace = '') {
        const nullSafe = Object.fromEntries(Object.entries(record).map(([k, v]) => [k, v ?? nullReplace]));
        return unsafeHTML(Function('"use strict";return (`' + str + '`)').bind(nullSafe)());
    }

    /**
     * Sorts records by a property ascending.
     * If handleSort is called with the prop we are already sorting by, cycle the direction [1, -1, 0]
     *
     * @param string nextProp
     */
    handleSort(nextProp) {
        if (this.sortProp == nextProp && this.sortProp != null && this.sortDir != 0) {
            if (this.sortDir == 1) {
                this.sortDir = -1;
            }
            else {
                this.sortDir = 0;
            }
        }
        else {
            this.sortProp = nextProp;
            this.sortDir = (nextProp != null) ? 1 : 0;
        }
    }

    canSort(nextProp) {
        return nextProp && this.columns.some(c => c.propName == nextProp);
    }

    /**
     * Handles filtering changes.
     * If a filter has a null value, remove the filter.
     *
     * @param string prop
     * @param Event e
     */
    handleSearch(prop, e) {
        const val = e.target.value;
        if (val) {
            this.filter[prop] = val;
        }
        else {
            delete this.filter[prop];
        }
        this.page = 0;
        this.requestUpdate();
    }

    getDistinctByCol(propName) {
        if (!propName || !this._records.length)
            return false;

        let unique = [];
        let distinct = [];
        for (let i = 0; i < this._records.length; i++) {
            let value = this.getValue(this._records[i], propName);
            if (!unique[value]) {
                distinct.push(value);
                unique[value] = true;
            }
        }

        return distinct;
    }

    /**
     * Get a value through dot snyax
     *
     * @param {*} record
     * @param {string} prop
     * @return {*}
     * @memberof CustomTable
     */
    getValue(record, prop) {
        const parts = prop.split('.');
        let value = record;
        let i = 0;

        while(i < parts.length && !isUndefined(value)) {
            value = value[parts[i]]
            i++;
        }

        return value;
    }

    guessColSearch(col) {
        if (!col.propName)
            return col.search ??= 'none';
        let distinct = this.getDistinctByCol(col.propName).filter(v => v !== null && v !== '');
        col.search ??= (distinct.length > this.selectMax || !distinct.every(v => typeof v === 'string')) ? 'text' : 'select'
        col.type ??= mode(distinct.map(v => typeof v));
    }

    renderSearchInput(col) {
        if (!this._records.length)
            return html`<th part="colfilter colfilter-none"></th>`;

        if (!col.search || !col.type)
            this.guessColSearch(col);

        switch (col.search) {
            case 'text': {
                return html`<th part="colfilter"><input part="colfilter-text" type="text" @change="${(e) => this.handleSearch(col.propName, e)}"
        .value=${live(this.filter[col.propName] ?? '')}></th>`;
            }
            case 'select': {
                let distinct = this.getDistinctByCol(col.propName).filter(v => v !== null && v !== '');
                return html`<th part="colfilter">
    <select @change="${(e) => this.handleSearch(col.propName, e)}" part="colfilter-select">
        <option value="">[ ALL ]</option>
        ${distinct.sort().map(val => html`<option value="${val}">${val}</option>`)}
    </select>
</th>`;
            }
            case 'select-many': {
                console.warn('select-many is not currently working');
                let distinct = this.getDistinctByCol(col.propName).filter(v => v !== null && v !== '');
                return html`<th part="colfilter">
    <select-many part="colfilter-selectmany" @change="${(e) => this.handleSearch(col.propName, e)}"
        .options="${distinct.sort()}"></select-many>
</th>`;
            }
            case 'none':
            default:
                return html`<th part="colfilter colfilter-none"></th>`;
        }
    }

    renderSortIndicator(col) {
        if (col.propName != this.sortProp || this.sortProp == null || this.sortDir == 0)
            return '';

        if (this.sortDir == -1)
            return '↑';
        else
            return '↓';
    }

    renderBody() {
        if (this.getRecords().length)
            return html`${this.getRecords().map(record => this.interpolate(this._rowTemplate, record))}`;
        else
            return html`<tr>
    <td colspan="8"></td>
</tr>`;
    }

    render() {
        const countWithFilter = this.getRecords(false).length;
        return html`
        <slot name="row"></slot>
        <slot name="colgroup"></slot>
        <slot name="thead"></slot>
        <table part="table" id="managedTable">
            ${templateContent(this.colgroupTemplate)}
            <thead part="head">
                <tr part="colheader-row">
                ${this.columns.map(col => html`
                <th @click="${() => this.handleSort(col.propName)}" part="${this.canSort(col.propName) ? 'colheader sortable' : 'colheader'}">
                    <span part="colheader-label">${col.label}</span>
                    <span>${this.renderSortIndicator(col)}</span>
                </th>
                `)}
                </tr>
                <tr part="colfilter-row">
                    ${this.columns.map(col => this.renderSearchInput(col))}
                </tr>
            </thead>
            <tbody part="body">
                ${this.renderBody()}
            </tbody>
        </table>
        <div part="pagination" class="${this.pageCount > 1 ? '' : 'hidden'}">
            <button part="pagination-btn pagination-btn-first" @click="${this.firstPage}">First</button>
            <button part="pagination-btn pagination-btn-prev" @click="${this.prevPage}">Previous</button>
            <span part="pagination-count">Page ${this.page + 1} / ${this.pageCount}</span>
            <button part="pagination-btn pagination-btn-next" @click="${this.nextPage}">Next</button>
            <button part="pagination-btn pagination-btn-last" @click="${this.lastPage}">Last</button>
        </div>
        <div>
            ${countWithFilter} ${countWithFilter > 1 ? 'records' : 'record'} ${countWithFilter < this._records.length ? `[ filtered from ${this._records.length} total ]` : ''}
        </div>
        `;
    }
}
customElements.define('custom-table', CustomTable);
