/**
 * columns 参数说明
 * */
interface GridViewRow {

    /**
     * 字段名称,如果设置了 value 可以省略(如果省略后,value 回调时 第一个参数为 undefine)
     * */
    field?: string;

    /**
     * 字段要显示的名称(显示在第一行中) 如果没有设置,将显示 field
     * */
    label?: any;

    /**
     * 自定义的值
     *  1). value 为 string 直接返回(直接显示)
     *  2). value 为 object 返回 以field为key的值  -> value[field]
     *  3). value 为 function 时执行并返回 value(v,r,i,f)
     *      参数说明:
     *          v == 字段所代表的值(如果没有设置field值为undefine)
     *          r == 一条数据的所有值
     *          i == 索引值
     *          f == field
     * */
    value?: string | object | ((value: any, row: any, index: number, field: string) => any);

    /**
     * 列的宽度(优先级最高,如果设置,会覆盖其他的设置的值)
     * */
    width?: number;

    /**
     * 对上面的值进行最后一次的格式化
     *  1). 以date- 开头的  格式化为 日期型
     *      nl = 2016-12-21 12:20:30
     *      ns = 2016-10-20
     *      zs = 2016年12月21日
     *      zl = 2016年12月21日 12:20:30
     *      ss = 20161221122030123
     *  2). price	转成价格 (value /100).toFixed(2)
     *      会将值 除以100后,保留2位小数
     *  3). status string !=1 显示红色
     *  4). [] 将按格式输出,改数组必须有2个元素.第一个元素 (字符串),第二个元素 (对象) ["class",{1:"-b",2:"-r"}]
     *      [0] ==class, 将根据值设置 class
     *      [0] ==style, 将根据值设置 style
     * */
    format?: string | Array<any>;

    /**
     * 头部td 属性
     * */
    headOption?: object;

    /**
     * 内容td 属性
     * */
    cellOption?: object;

    /**水平对齐*/
    align?: string;

    /**垂直对齐 */
    valign?: string;

    /**缩进 */
    indent?: number;
}


interface GridViewConfig {

    data?: GridViewData;

    table?: GridViewTable;

    handle?: GridViewHandle;

    head?: GridViewHead;

    footer?: GridViewFooter;

    tr?: GridViewTr;

    td?: GridViewTd;

}

interface GridViewData {

    columns?: Array<GridViewRow>;

    provider?: Array<any>;

    selectIndex?: number;

    copydata?: boolean;
}

interface GridViewTable {

    attr?: any;

}

interface GridViewHandle {

    callback?: (at?: string, target?: Element, data?: any, index?: number) => void;

    callhead?: (at?: string, target?: Element) => void;

    stopPropagation?: boolean;

}

interface GridViewHead {

    //dom?: Element;

    show?: boolean;

    attr?: any;

}

interface GridViewFooter {

    //dom?: Element;

    text?: string;

    attr?: any;
}

interface GridViewTr {

    attr?: any;

    //odd?: any;

    //even?: any
}

interface GridViewTd {

    attr?: any;
}

