/**
 * Created by yishan on 17/3/1.
 */


var completeNum = 0;//完成的事件数量
var runningNum = 0;//正在执行的事件数量
//taskid
//var id;
//打开数据库
var dataBase ;

//加载本地数据库数据
window.onload = selectData();

/**
 * enter 添加条目
 */
function add() {
    var list = document.getElementById('form');
    var content = list.value;
    var str = new String(content);//防止内存泄露
    list.value = null;
    if (str.length > 0) {
        var li = creatDom( content, null);
        var list = document.getElementById('list');
        list.appendChild(li);//添加到list
        //添加数据到数据库-并更新taksId
        insertData(content, "false")
        //更新事件数量
        updateTask();
    }

}
/**
 * 创建元素
 * @param content 事件内容
 * @param iscomplete 是否完成
 * @param data 数据源
 */
function creatDom( content, iscomplete) {
    //模板
    var check = ''
    if (iscomplete == "true") {
        check = "checked"
    }
    var template = '<input type="checkbox" class="check" ' +
        check + '>' +
        '<label class="content">' +
        content +
        '</label>' + '<button type="button" class="close btn-del" aria-label="Close">' +
        '<span aria-hidden="true" class="text-danger">x</span>' +
        '</button>;';

    var li = document.createElement('li');
    li.innerHTML = template;
    return li

}

//生成随机id--不严密 暂时这样--已同步rowid
function randomID() {
    return Math.random(1);
}




var list = document.getElementById('list');
var list1 = document.getElementById('list1');
//给事件任务列表绑定事件--事件冒泡
list.addEventListener('click', function (e) {
    if (e.target.nodeName == "INPUT") {
        var li = e.target.parentNode;//获取父级元素 li
        if (e.target.checked) {//判断是否勾选
            //选中就从list中移除
            list.removeChild(li);
            list1.appendChild(li);
           var content =  li.innerText;
            content = content.substr(0,content.length-2);
            //更新数据库数据状态
            updataDataBase('true',content);
            updateTask(true);
        }
    }
});

//给事件完成列表添加事件
list1.addEventListener('click', function (e) {
    if (e.target.nodeName == "INPUT") {
        var li = e.target.parentNode;//获取父级元素 li
        if (!e.target.checked) {//判断是否勾选
            //选中就从list中移除
            list1.removeChild(li);
            list.appendChild(li);
            var content =  li.innerText;
            content = content.substr(0,content.length-2);
            updataDataBase('false',content)
            updateTask();
        }
    }
});
//删除
document.body.addEventListener('click', function (e) {
    if (e.target.nodeName == 'SPAN') {
        //获取ul列表
        var suplist = e.target.parentNode.parentNode.parentNode;
        //要被删除的列表
        var sublist = e.target.parentNode.parentNode;
        suplist.removeChild(sublist);
        //回车键 后多来
        var con = sublist.innerText;
        con = sublist.innerText.substr(0, con.length - 2);
        deleteDatabase(con)
        //删除完毕 更新页面数量
        updateTask()
    }
})


//更新事件数量
function updateTask() {
    //更新 正在进行的事件数量
    var run = document.getElementById('running');
    var compeleted = document.getElementById('completed');

    //列表组
    var lists = document.getElementById('list');
    var lists1 = document.getElementById('list1');
    run.innerText = lists.children.length;
    compeleted.innerText = lists1.children.length;

}


//没用上
function creatDatabase() {
    /**
     * 1.打开已存在的数据库 如果不存在就新创建
     * 参数1 数据库名称
     * 参数2 数据库版本号
     * 参数3 数据库的描述
     * 参数4 分配的存储空间(单位kb)
     * 参数5 回调函数名(可以省略)
     */
    dataBase= window.openDatabase('task', '1.0', '事件记录', 1024 * 10);
    if (!dataBase) {
        alert('你的浏览器不支持本地数据库')
    }
    //2.创建数据库表
   addinfo();
}

//执行创建表的操作
function addinfo() {
    var sql = 'create table mytask(taskcontent text,taskiscomplete)';
    dataBase.transaction(function (db) {
        db.executeSql(sql)
    }, function (db,error) {
        console.log(error);
    }, function (db,success) {
        console.log('创建表失败'+success);
    })
}
/**
 * 删除指定行
 * str:是内容  获取id有难度  牺牲点效率
 */
function deleteDatabase(str) {
    dataBase.transaction(function (db) {
        var sql = ''
        db.executeSql('DELETE FROM mytask WHERE taskcontent=?', [str], function (db, success) {
            console.log(success)
        }, function (db, error) {
            console.log('删除失败' + error);
        })
    })
}

/**
 * 插入数据到数据库
 * @param taskid
 * @param taskcontent
 * @param taskiscomplete
 */
function insertData( taskcontent, taskiscomplete) {
    dataBase.transaction(function (db) {
        db.executeSql('insert into mytask values(?,?)', [taskcontent, taskiscomplete], function (db, me) {

        }, function (db, error) {
            console.log("插入失败"+error)
        });
    })
}
/**
 * 更新数据
 * str: 字符串 true/false
 */
function updataDataBase(istrue,content) {
    dataBase.transaction(function (db) {
        db.executeSql('update mytask set taskiscomplete=?where taskcontent=?', [istrue,content], function (db, message) {
            console.log('更新成功');
        }, function (db, error) {
            console.log('更新状态失败' + error);//失败提示
        })
    })
}

//查询数据库并更新到页面
function selectData() {
    //创建数据库-如果存在就打开
   creatDatabase();
    if (!dataBase) {
        alert('浏览器不支持');
        return;
    }

    //查询表 展示到页面
    dataBase.transaction(function (db) {
        db.executeSql('SELECT * FROM mytask ', [], function (db, result) {
            var taskdata = result.rows;
            if (taskdata) {
                for (var i = 0; i < taskdata.length; i++) {
                    //伪数组转换数组
                   var arr = Array.prototype.slice.call(taskdata);
                    var task = arr[i];
                    var dom = creatDom(task.taskcontent, task.taskiscomplete);
                    var list = document.getElementById('list');
                    var list1 = document.getElementById('list1');
                    if (task.taskiscomplete == "true") {
                        list1.appendChild(dom);//添加到list1
                    } else {
                        list.appendChild(dom);//添加到list
                    }
                    //更新事件数量
                    updateTask();
                }
            }
        }, function (db, success) {
            console.log(success);
        })
    })
}


//更新下taskId-此法不兼容Safari  废弃
function updataTaksId() {
    dataBase.transaction(function (db) {
        db.executeSql('UPDATE mytask set taskId=rowid WHERE taskId!=rowid');
    })
}


//监听关闭
//window.onbeforeunload = onbeforeunload_handler;
//
//function onbeforeunload_handler() {
//    //更新下数据库
//    updataTaksId();
//    var warning = "确认退出?";
//    return warning;
//}