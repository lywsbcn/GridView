# GridView
```

let list = new GridView8();

list.columns([
    { field: "id", label: "ID", width: 50 },
    { field: "code", label: "编号" },
    { field: "username", label: "用户名" },
    { field: "fullname", label: "全名" },
    { field: "p_code", label: "上级编号" },
    { field: "status", label: "状态", value: { 1: "启用", 2: "停用" } },
    {
        field: "createtime", label: "创建时间", format: "date-nl", width: 180, align:"left"
    },
    {
        field: "status", label: "管理", value: function (r) {
            return "" +
                "<a class='hand' at='cashAccount'>资金账户</a>" + "" +
                "<a class='hand' at='edit'>编辑</a>" + "" +
                "<a class='hand' at='status'>" + (r == 1 ? "停用" : "启用") + "</a>" + "" +
                "<a class='hand' at='pwd'>修改密码</a>";
        }, width: 250
    }
])

list.callback = (at) => {

    console.log(at);
}

document.body.appendChild(list.dom);
```
