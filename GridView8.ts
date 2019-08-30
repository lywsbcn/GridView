

class GridView8 {
    /**配置*/
    private config = {
        data: {
            columns: <Array<GridViewRow>>[],
            provider: [],
            selectIndex: -1,
            copydata: true
        },
        table: {
            attr: {
                className: "jh-gridview2"
            }
        },
        handle: {
            /**
            *  数据行的点击回调,
            *  target 被点击的节点(不是 tr 对象)
            *  data点击这一行的对应的对象
            *  index  点击这一行的索引      
            * */
            callback: <(at?: string, data?: any, target?: Element, index?: number) => void>null,

            /**
             * 头部行的点击回调,
             * target 被点击的节点(不是 tr 对象)
             * */
            callhead: <(at?: string, target?: Element) => void>null,

            /** 是否阻止冒泡*/
            stopPropagation: true
        },
        head: {
            dom: <Element>null,
            show: true,
            attr: {
                className: "gd_hd_tr"
            }
        },
        footer: {
            dom: <Element>null,
            text: "没有记录了",
            attr: {
                className: "gd_ft_tr"
            }
        },
        tr: {
            attr: {
                className: "gd_bd_tr"
            }
        },
        td: {
            attr: {

            }
        }


    }

    public setConfig(config: GridViewConfig) {
        this.setData(this.config, config);

        return this;
    }

    set callback(handle: (at?: string, data?: any, target?: Element, index?: number) => void) {
        this.config.handle.callback = handle;
    }

    set callhead(handle: (at?: string, target?: Element) => void) {
        this.config.handle.callhead = handle;
    }


    /**
     * 事件
     * @param e
     */
    private didClick(e) {

        if (this.config.handle.stopPropagation) e.stopPropagation();

        let target: Element = e.target || e.srcElement;
        let at = target.getAttribute("at");
        at = at === void 0 ? "" : at;

        let ptarget = target;

        while (ptarget != this.dom) {

            if (ptarget.parentElement == this.dom) {


                if (ptarget == this.config.head.dom) {
                    if (typeof (this.config.handle.callhead) === "function") {

                        this.config.handle.callhead(at, target);
                    }

                    return;
                }

                if (ptarget == this.config.footer.dom) {

                    return;
                }


                let tr = <HTMLTableRowElement>ptarget;

                let index = tr.rowIndex - 1;

                this.config.data.selectIndex = index;

                if (typeof (this.config.handle.callback) === "function") {

                    this.config.handle.callback(at, this.config.data.provider[index], target, index);

                    return;
                }

                return;
            }


            ptarget = ptarget.parentElement;
        }



    }

    private hanlder = (e) => { this.didClick(e); };


    /** 表格对象 */
    public dom: HTMLTableElement;

    /**初始化 */
    public init() {
        if (!this.dom) {
            this.dom = document.createElement("table");
            this.setAttr(this.dom, this.config.table.attr);

            this.dom.addEventListener("click", this.hanlder);

        }
    }

    public destory() {
        if (this.dom) {
            this.dom.removeEventListener("click", this.hanlder);

            this.config.handle.callback = null;

            this.config.handle.callhead = null;

            this.cleanup();

            this.config.data.columns = [];

            this.config.data.provider = [];

            if (this.config.head.dom) {
                this.config.head.dom.remove();
                this.config.head.dom = null;
            }
        }
    }



    /**
     * 设置列,只接受数组 来初始化运行后将显示 头部
     * 调用后才开始初始化 dom 对象
     * 会先调用 init()
     * @param columns
     */
    public columns(columns: Array<GridViewRow>): this {

        this.init();

        this.config.data.columns = columns;

        let dom = document.createElement("tr");

        this.dom.appendChild(dom);

        for (let x in columns) {

            let col = columns[x];

            let td = document.createElement("td");

            let label = col.label === void 0 ? col.field : this.getHeadContent(col.label);

            td.innerHTML = label;

            //设置其他属性

            if (col.width !== void 0) {
                td.style.width = col.width + "px";
            }

            if (col.align !== void 0) {
                td.style.textAlign = col.align;
            }

            if (col.valign !== void 0) {
                td.style.verticalAlign = col.valign;
            }

            if (col.indent !== void 0) {
                td.style.textIndent = col.indent + "px";
            }

            if (col.headOption !== void 0) {
                this.setAttr(td, col.headOption);
            }

            dom.appendChild(td);

        }

        if (!this.config.head.show) {
            dom.style.display = "none";
        }

        this.setAttr(dom, this.config.head.attr);


        this.config.head.dom = dom;

        return this;
    }

    /**
     * 参数接受一个单条的数据,在最后新增一行数据
     * @param {object} provider 必须是一个对象
     */

    public add(provider: object): this {

        let len = this.dom.childElementCount;

        let tr = this.buildTr(provider, len);

        this.dom.appendChild(tr);

        this.config.data.provider.push(provider);

        this.reset()

        return this;
    }


    /**
    * 参数是数据源,必须是一个数组(调用该方法,默认会调用一次cleanup())
    * 如果你不想清空数据,请设置   isClean=false;
    * @param {array} provider 数据源
    * @param {bool} isClean 加载数据时,是否清空原来的数据
    */

    public load(provider: Array<object>, isClean = true): this {

        if (isClean) {
            this.cleanup();
        }

        for (var x in provider) {
            this.add(provider[x]);
        }


        return this;
    }

    /**
     * 更新表格中的某一行数据
     * 如果,指定的条件没有查询到,将更新当前被选中行
     * 如果,指定条件没有查询到,并且未选中行,将不进行更新
     * @param {object} provider   必须是一个对象,未设置的属性将不进行修改   
     * @param {object} condition   对象,将首先根据这个来检索要更新的行索引
     * @param {int} index  如果condition==null,则更新指定索引的数据
     * 如果condition 匹配到一条或者多条数据,index表示匹配到数据中的索引,
     * index==-1 时,表示更新匹配数据的最后一条
     */
    public update(provider: object, condition?: object, index?: number): this {

        index = this.indexof(condition, index);

        if (index == -1) return this;

        let data = this.config.data.provider[index];
        this.setData(data, provider);

        let tr = this.buildTr(data, index);

        let dtr: any = this.dom.childNodes[index + 1];

        dtr.innerHTML = tr.innerHTML;

        this.reset();

        return this;
    }

    /**
     * 更新表格中符合条件的所有记录
     * @param provider 必须是一个对象,未设置的属性将不进行修改
     * @param conditon 必须是一个对象 如: {pid:2}
     */
    public updateAll(provider: object, conditon?: object): this {

        var index_list = this.indexofAll(conditon);

        if (index_list.length == 0) return this;

        for (var i = 0; i < index_list.length; i++) {

            this.update(provider, null, index_list[i]);
        }

        this.reset();

        return this;
    }

    /**
     * 删除符合条件的一条记录
     * 注意:如果符合条件的有多条,也只删除一条
     * @param conditon 对象,将首先根据这个来检索要更新的行索引
     * @param index  如果condition==null,则更新指定索引的数据
     * 如果condition 匹配到一条或者多条数据,index表示匹配到数据中的索引,
     * index==-1 时,表示更新匹配数据的最后一条
     */
    public del(conditon?: object, index?: number): this {

        index = this.indexof(conditon, index);

        if (index == -1) return this;

        this.config.data.provider.splice(index, 1);

        this.dom.childNodes[index + 1].remove();

        this.reset();

        return this;
    }

    /**
     * 删除index 数组指定的记录 或者condition指定的条件的记录
     * 注意: 这里的index参数 数组
     * 
     * 当指定condition 属性时,index将无效
     * 
     * @param condition 必须是一个对象 如: {pid:2}
     * @param index 要删除的索引列表
     */
    public delAll(condition?: object, index?: Array<number>): this {

        let datas = [];

        index = index === void 0 ? [] : index;
        if (condition) index = this.indexofAll(condition);

        let len = this.config.data.provider.length;
        for (let i = 0; i < index.length; i++) {
            if (index[i] < len) {
                datas.push(this.config.data.provider[index[i]]);
            }
        }

        for (var x in datas) {
            for (let i = 0; i < this.config.data.provider.length; i++) {
                if (this.config.data.provider[i] == datas[x]) {

                    this.config.data.provider.splice(i, 1);

                    this.dom.childNodes[i + 1].remove();

                    break;
                }
            }
        }

        return this;
    }
    /**
    * 在符合条件条件的记录 后面 新增一条记录或多条记录
    * 注意: 如果后面参数都不指定,将在被选中的一行 后面 添加一条记录
    * @param provider 必须是一个对象或数组
    * @param condition 必须是一个对象 如: {pid:2}
    * @param index 如果condition==null,则更新指定索引的数据
    * 如果condition 匹配到一条或者多条数据,index表示匹配到数据中的索引,
    * index==-1 时,表示更新匹配数据的最后一条
    */
    public after(provider: object | Array<object>, condition?: object, index?: number): this {
        let isArr = this.isArray(provider);

        let count = this.config.data.provider.length;

        //如果还没有添加数据,者直接添加数据
        if (count == 0) {
            if (isArr) this.load(<Array<object>>provider);
            else this.add(provider);

            return this;
        }

        index = this.indexof(condition, index);

        //如果没有找到,或者索引为最后一条,
        //向最后追加数据
        if (index < 0 || count - 1 == index) {
            if (isArr) this.load(<Array<object>>provider);
            else this.add(provider);

            return this;
        }

        let row = this.dom.childNodes[index + 2];

        if (isArr) {
            (<Array<object>>provider).reverse();

            let len = (<Array<object>>provider).length;

            for (let i = 0; i < len; i++) {
                let tr = this.buildTr(provider[i], index + (len - i))

                this.config.data.provider.splice(index + 1, 0, provider[i]);

                this.dom.insertBefore(tr, row);
            }
        } else {

            let tr = this.buildTr(provider, index + 1);

            this.config.data.provider.splice(index + 1, 0, provider);

            this.dom.insertBefore(tr, row);
        }

        this.reset();

        return this;
    }
    /**
    * 在符合条件条件的记录 前面 新增一条记录或多条记录
    * 注意: 如果后面参数都不指定,将在被选中的一行 前面 添加一条记录
    * @param provider 必须是一个对象或数组
    * @param condition 必须是一个对象 如: {pid:2}
    * @param indexindex 如果condition==null,则更新指定索引的数据
    * 如果condition 匹配到一条或者多条数据,index表示匹配到数据中的索引,
    * index==-1 时,表示更新匹配数据的最后一条
    */
    public before(provider: object | Array<object>, condition?: object, index?: number): this {

        let isArr = this.isArray(provider);

        let count = this.config.data.provider.length;

        //如果还没有添加数据,者直接添加数据
        if (count == 0) {
            if (isArr) this.load(<Array<object>>provider);
            else this.add(provider);

            return this;
        }

        index = this.indexof(condition, index);

        index = index < 0 ? 0 : index;

        let row = this.dom.childNodes[index + 1];

        if (isArr) {

            let len = (<Array<object>>provider).length;

            for (let i = 0; i < len; i++) {

                let tr = this.buildTr(provider[i], index + i);

                this.dom.insertBefore(tr, row);

                this.config.data.provider.splice(index + i, 0, provider[i]);
            }
        } else {

            let tr = this.buildTr(provider, index - 1);

            this.dom.insertBefore(tr, row);

            this.config.data.provider.splice(index, 0, provider);

        }

        this.reset();

        return this;
    }

    /**
     * 获取数据源所有数据
     * */
    public getProvider(): Array<any> {
        return this.config.data.provider;
    }

    /**
    * 获取符合条件条件的数据 列表
    * 注意: 如果后面参数都不指定,将获取 空数组
    * 
    * 当指定conditon时,index无效
    * 
    * @param conditon 必须是一个对象 如: {pid:2}
    * @param index 要删除的索引列表
    */
    public getDatas(condition?: object, index?: Array<number>) {

        if (condition) index = this.indexofAll(condition);
        index = index === void 0 ? [] : index;

        let data = [];
        for (let i = 0; i < index.length; i++) {
            data.push(this.config.data.provider[i]);
        }

        return data;
    }

    /**
     * 获取符合条件条件的数据
     * 注意: 如果后面参数都不指定,将获取 被选中的一行的数据
     * @param conditon 必须是一个对象 如: {pid:2}
     * @param index 如果condition==null,则更新指定索引的数据
     * 如果condition 匹配到一条或者多条数据,index表示匹配到数据中的索引,
     * index==-1 时,表示更新匹配数据的最后一条
     */
    public getData(conditon?: object, index?: number) {

        index = this.indexof(conditon, index);

        if (index == -1 || index >= this.config.data.provider.length) return null;

        return this.config.data.provider[index];
    }

    /**
     * 获取符合条件条件的数据 某个属性
     * 
     * 
     * 
     * 注意: 如果后面参数都不指定,将获取 被选中的一行的数据
     * @param key   key
     * @param condition 必须是一个对象 如: {pid:2}
     * @param index 如果condition==null,则更新指定索引的数据
     * 如果condition 匹配到一条或者多条数据,index表示匹配到数据中的索引,
     * index==-1 时,表示更新匹配数据的最后一条
     */
    public get(key: string, condition?: object, index?: number) {
        let data = this.getData(condition, index);

        if (!data) return null;

        return data[key];
    }

    /**
     * 将清空表格的数据和表格(包括底部)
     * */
    public cleanup(): this {
        this.config.data.provider = [];

        let rows = this.dom.childNodes;
        let len = this.dom.childElementCount;
        for (var i = len - 1; i >= 0; i--) {
            if (rows[i] == this.config.head.dom) continue;
            rows[i].remove();
        }

        this.reset();

        return this;
    }
    /**
     * 显示无数据的一行(底部),str为要显示的内容
     * @param str
     */
    public empty(str?: string): this {

        this.removeEmpty();

        str = str === void 0 ? this.config.footer.text : str;

        let dom = document.createElement("tr");

        let td = document.createElement("td");
        td.innerHTML = str;
        td.colSpan = this.config.data.columns.length;

        dom.appendChild(td);

        this.dom.appendChild(dom)

        this.config.footer.dom = dom;

        return this;
    }

    /**
     * 删除显示无数据的一行(底部)
     * */
    public removeEmpty(): this {
        if (this.config.footer.dom) {
            this.config.footer.dom.remove();
            this.config.footer.dom = null;
        }
        return this;
    }

    /**
     * 创建一行视图
     * @param {object} data 
     * @param {int} index 
     */
    private buildTr(data: object, index: number): Element {

        let tr = document.createElement("tr");

        this.setAttr(tr, this.config.tr.attr);

        for (let x in this.config.data.columns) {

            let col = this.config.data.columns[x];

            let con = col.value === void 0 ? data[col.field] : this.getContent(col.field, data, index, col.value);

            con = col.format === void 0 ? con : this.format(con, col.format, data[col.field]);

            let td = document.createElement("td");

            this.setAttr(td, this.config.td.attr);

            if (con instanceof Element) {
                td.innerHTML = "";
                td.appendChild(con);
            } else {
                td.innerHTML = con;
            }

            if (col.width !== void 0) {
                td.style.width = col.width + "px";
            }
            if (col.align !== void 0) {
                td.style.textAlign = col.align;
            }
            if (col.valign !== void 0) {
                td.style.verticalAlign = col.valign;
            }

            if (col.indent !== void 0) {
                td.style.textIndent = col.indent + "px";
            }

            if (col.cellOption !== void 0) {
                this.setAttr(td, col.cellOption);
            }

            tr.appendChild(td);

        }

        return tr;
    }




    private indexofAll(condition?: object): Array<number> {

        if (condition === void 0 || condition === null) return [];

        let ilist = [];

        for (let i = 0; i < this.config.data.provider.length; i++) {

            let tp = this.config.data.provider[i];

            let len = 0;
            let hit = 0;

            for (let x in condition) {
                len++;

                if (condition[x] == tp[x]) {
                    hit++;
                }

                if (len == 0) break;
                if (len == hit) {
                    ilist.push(i);
                }
            }
        }


        return ilist;
    }

    private indexof(condition?: object, index?: number): number {

        //如果条件都未指定,返回当前被选择的index
        if (condition === void 0 && index === void 0) return this.config.data.selectIndex;

        //如果condition===null ,设置了index;
        //index < 0 表示最后一行
        //index >=0 表示指定索引
        //index > 数据长度,返回 -1 没找到
        if (condition === null) {

            if (index < 0) return this.config.data.provider.length;

            if (index < this.config.data.provider.length) return index;

            return -1;
        }

        if (index !== void 0) {
            let ilist = this.indexofAll(condition);
            if (index < 0 || index >= ilist.length) return ilist[ilist.length - 1];
            return ilist[index];
        }

        for (let i = 0; i < this.config.data.provider.length; i++) {
            let tp = this.config.data.provider[i];

            let len = 0;
            let hit = 0;

            for (let x in condition) {
                len++;
                if (condition[x] == tp[x]) {
                    hit++;
                }
            }

            if (len == 0) return -1;
            if (len == hit) return i;
        }
        return -1;

    }


    /**
    * 更新对象的数据
    * @param {object} data  被更新的对象
    * @param {object} value 
    */
    private setData(data: object, value: object) {

        if (!data || !value) return;

        for (var x in value) {

            var d = value[x];

            if (this.isArray(d)) {

                data[x] = d;

                continue;
            }

            if (typeof (d) === "object") {
                if (data[x] === void 0) data[x] = {};
                this.setData(data[x], d);

                continue;
            }

            data[x] = d;
        }

    }

    /**
    * 调用上面的更新,插入,修改等操作后都会调用该方法
    * 重置一些参数
    * 
    * show == true时,当无数据是将进行无数据提示
    * @param {bool} show 
    */
    private reset(show?): this {

        this.config.data.selectIndex = -1;

        if (this.config.data.provider.length == 0) {

            if (show === true) {
                this.empty();
            }
        } else {

            this.removeEmpty();
        }

        return this;
    }

    public selectRow(index) {
        var nodes = this.dom.querySelectorAll('tr[select]');
        nodes.forEach((node) => {
            node.removeAttribute('select');
        });

        let node = this.dom.querySelector("tr:nth-child(" + (index + 1) + ")");
        node.setAttribute('select', '');
    }


    /**
     * 获取头部的数据
     * @param {*} v 
     */
    private getHeadContent(v) {

        if (typeof (v) === "string") return v;

        if (typeof (v) === "function") return v();

        if (typeof (v) === "undefined") return "";
    }

    /**
     * 用于获取单元格数据
     * @param {string} f 
     * @param {object} r 
     * @param {int} i 
     * @param {*} v 
     */
    private getContent(f, r, i, v) {
        switch (typeof (v)) {
            case "string": return v;
            case "function": return v(r[f], r, i, f);
            case "object": return v[r[f]];
        }
    }
    /**
     * 判断是否为数据
     * @param a
     */
    private isArray(a): boolean {
        return Object.prototype.toString.call(a) == '[object Array]';
    }

    /**
     * 设置属性
     * @param element
     * @param object
     */
    private setAttr(element: Element, obj: object) {

        for (var x in obj) {
            let v = obj[x];
            let notdot = x.search(/\./) == -1;

            if (this.isArray(v)) {
                if (notdot) {
                    try {
                        if (typeof (element[x]) === "function") eval("element." + x + "(" + v + ")");
                        else element[x] = v;
                    } catch (e) {
                        console.warn(e);
                    }

                } else {
                    try {
                        let o = eval("element." + x);
                        if (typeof (o) === "function") o(v);
                        else o = v;
                    } catch (e) {
                        console.warn(e);
                    }
                }

                continue;
            }

            if (typeof (v) === "object") {

                if (notdot) {
                    try {
                        this.setAttr(element[x], v);
                    } catch (e) {
                        console.warn(e);
                    }
                }
                else {
                    try {
                        let o = eval("element." + x);
                        this.setAttr(o, v);
                    } catch (e) {
                        console.warn(e);
                    }
                }

                continue;
            }

            if (notdot) {
                try {
                    if (typeof (element[x]) === "function") eval("element." + x + "(" + v + ")");
                    else element[x] = v;
                } catch (e) {
                    console.warn(e);
                }

            } else {
                try {
                    let o = eval("element." + x);
                    if (typeof (o) === 'function') o(v);
                    else o = v;
                } catch (e) {
                    console.warn(e);
                }
            }


        }

    }


    /**
     * 格式化数据
     * @param {string} string 为最后要格式化的值
     * @param {*} type 为要格式化的类型
     * @param {*} value 为原始值
     */
    private format(string, type, value): any {
        switch (type) {
            case "date-nl":
                return this.unixToStr2(string, "nl");
            case "date-ns":
                return this.unixToStr2(string, "ns");
            case "date-zl":
                return this.unixToStr2(string, "zl");
            case "date-zs":
                return this.unixToStr2(string, "zs");
            case "price":
                return (parseInt(string) / 100).toFixed(2);
            case "status":
                return (parseInt(value) != 1 ? "<span style='color:#f00;'>" + string + "</span>" : string)

            default:
                return string;
        }
    }


    /*
        根据unix 返回日期格式
        type 默认 nl 返回 2016-12-21 12:20:30
        type==ns 返回 2016-10-20
        type==zs 返回 2016年12月21日
        type==zl 返回 2016年12月21日 12:20:30
        type==ss 返回 20161221122030123
 
        dates   返回多少天后的日期,默认为0
        如果为负数 -30表示30天前
   
        unix 为空 或 ==0  返回 空字符串
    */
    private unixToStr2(unix, type?, dates?): any {
        if (unix === void 0) { unix = 0; }
        if (type === void 0) { type = "nl"; }
        if (dates === void 0) { dates = 0; }
        var the_date = null;
        if (unix != 0) {
            the_date = new Date(unix * 1000);
        }
        if (the_date == null || unix == 0) return "-";
        the_date.setDate(the_date.getDate() + dates);
        var Y = the_date.getFullYear();
        var M = the_date.getMonth() + 1;
        var D = the_date.getDate();
        var H = the_date.getHours();
        var m = the_date.getMinutes();
        var s = the_date.getSeconds();
        var ms = the_date.getMilliseconds();
        var Y_s = String(Y);
        var M_s = M < 10 ? ("0" + M) : M;
        var D_s = D < 10 ? ("0" + D) : D;
        var H_s = H < 10 ? ("0" + H) : H;
        var m_s = m < 10 ? ("0" + m) : m;
        var s_s = s < 10 ? ("0" + s) : s;
        var ms_s = ms < 10 ? ("00" + ms) : ms < 100 ? ("0" + ms) : ms;
        switch (type) {
            case "ns":
                return Y_s + "-" + M_s + "-" + D_s;
            case "nl":
                return Y_s + "-" + M_s + "-" + D_s + " " + H_s + ":" + m_s + ":" + s_s;
            case "zs":
                return Y_s + "年" + M_s + "月" + D_s + "日";
            case "zl":
                return Y_s + "年" + M_s + "月" + D_s + "日 " + H_s + ":" + m_s + ":" + s_s;
            case "ss":
                return Y_s + M_s + D_s + H_s + m_s + s_s + ms_s + "";
            default:
                return Y_s + "-" + M_s + "-" + D_s + " " + H_s + ":" + m_s + ":" + s_s;
        }
    }
}