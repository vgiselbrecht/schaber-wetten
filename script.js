var loggedIn = false;
var username = '';
var mode = 't';
var id = 0;
var menu;
var source2;

var hash = window.location.hash;
setInterval(function(){
    if (window.location.hash != hash) {
        hash = window.location.hash;
        if(hash != '#events')
        {
            changeToTermine();
        }
    }
}, 100);


source = new EventSource("server.php?f="+5);

source.addEventListener("newTermin", function(e) {
    if (mode == 't')
    {
        writeTermine(JSON.parse(e.data));
    }
    menu = JSON.parse(e.data);
}, false);

$(document).ready(function () {  
    
    //Laden Dialog
    loading();
    
    //Login status
    $.getJSON('server.php?f=2', function(result) {
        if (result[0] == '1')
        {
            setLogin(result[1])
        }
    });
    
    //Dialog
    $('a.buttonDia').click(function () {       
        $('#dialog-overlay, #dialog-box').hide();         
        return false;  
    });  
    $(window).resize(function () {  
        if (!$('#dialog-box').is(':hidden')) popup();         
    });  
    
    jQuery(function($){
        $.datepicker.regional['de'] = {
            clearText: 'löschen', 
            clearStatus: 'aktuelles Datum löschen',
            closeText: 'schließen', 
            closeStatus: 'ohne Änderungen schließen',
            prevText: '<zurück', 
            prevStatus: 'letzten Monat zeigen',
            nextText: 'Vor>', 
            nextStatus: 'nächsten Monat zeigen',
            currentText: 'heute', 
            currentStatus: '',
            monthNames: ['Januar','Februar','März','April','Mai','Juni',
            'Juli','August','September','Oktober','November','Dezember'],
            monthNamesShort: ['Jan','Feb','Mär','Apr','Mai','Jun',
            'Jul','Aug','Sep','Okt','Nov','Dez'],
            monthStatus: 'anderen Monat anzeigen', 
            yearStatus: 'anderes Jahr anzeigen',
            weekHeader: 'Wo', 
            weekStatus: 'Woche des Monats',
            dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
            dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
            dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
            dayStatus: 'Setze DD als ersten Wochentag', 
            dateStatus: 'Wähle D, M d',
            dateFormat: 'dd.mm.yy', 
            firstDay: 1, 
            initStatus: 'Wähle ein Datum', 
            isRTL: false
        };
        $.datepicker.setDefaults($.datepicker.regional['de']);
    }); 
    
    //Uhrzeit
    zeitanzeige();
    window.setInterval("zeitanzeige()",1000);
});

function writeLoginScreen()
{
    var msg = '<div class="loginLabel">Anmelden</div><table class="loTa">';
    msg += '<tr class="liCo errorTr"><td class="liLe"></td><td class="liRe"><div id="vaEm"></div></td></tr>';
    msg += '<tr class="liCo"><td class="liLe">Email:</td><td class="liRe"><input name="email" spellcheck="false" autofocus id="loEm" class="loginField inputText" type="text" /></td><tr>';
    msg += '<tr class="liCo errorTr"><td class="liLe"></td><td class="liRe"><div id="vaPa"></div></td></tr>';
    msg += '<tr class="liCo"><td class="liLe">Passwort:</td><td class="liRe"><input id="loPa" class="loginField inputText" type="password" onkeydown="if (event.keyCode == 13) { login(); return false; }" /></td><tr>';
    msg += '</table><div id="loginError"></div><input class="loginButton button" style="font-size:17px" onclick="login()" type="submit" value="Anmelden"/>';
    popup(msg);
}

function login()
{
    $('.wrongInput').hide();
    var em = $("#loEm").val();
    var password = $("#loPa").val();
    if (em == "")
    {
        $("#vaEm").append(' <span class="wrongInput">Eingabe Benötigt</span>');
    }
    if (password == "")
    {
        $("#vaPa").append(' <span class="wrongInput">Eingabe Benötigt</span>');
    }
    if (em != "" && password != "")
    {
        jQuery.ajax({
            url: "server.php?f=1",
            type: "POST",
            data: {
                username: em, 
                password: password
            },
            dataType: "json",
            success: function(result) {
                if (result)
                {
                    setLogin(result[0]);
                }
                else
                {
                    $("#loginError").append(' <span class="wrongInput">Falsche Zugangsdaten</span>');
                }
            }
        });
    }
}

function setLogin(un)
{
    loggedIn = true;
    username = un;
    if (mode == 't')
    {
        writeSetTermine();    
    }
    else if (mode == 'e')
    {
        writeEventStop();
    }
    $('#loginLogout').html('<a class="link" onclick="logout()">Logout</a>');
    $('#dialog-overlay, #dialog-box').hide(); 
}

function logout()
{
    jQuery.ajax({
        url: "server.php?f=3",
        type: "POST",
        data: {},
        dataType: "json",
        success: function(result) {
            loggedIn = false;
            username = '';
            $('#loginLogout').html('<a class="link" onclick="writeLoginScreen()">Login</a>');
            $("#logedinArea").html("");
        }
    });
}

function writeSetTermine()
{
    var print = '<table><tr><td>Bezeichnung:</td><td><input type="text" id="terminBez" class="inputText" /></td><td>Termin:</td><td><input size="10" type="text" class="datepicker inputText" id="terminZeit"/></td><td><input type="submit" onclick="setNewTermin()" value="Speichern"/></td></tr></table>';
    $("#logedinArea").html(print);
    $( ".datepicker" ).datepicker();
}

function writeEventStop()
{
    var print = '<input id="eventFin" value="Schaber ist da" class="button" onclick="eventStop()" type="submit"/>';
    $("#logedinArea").html(print);
}

function eventStop()
{
    jQuery.ajax({
        url: "server.php?f=8",
        type: "POST",
        data: {
            id: id
        },
        dataType: "json",
        success: function(result) {
        }
    });
}

function setNewTermin()
{
    var tb = $("#terminBez").val();
    var tz = $("#terminZeit").val();
    if (tb != "" && tz != "")
    {
        jQuery.ajax({
            url: "server.php?f=4",
            type: "POST",
            data: {
                tb: tb, 
                tz: tz
            },
            dataType: "json",
            success: function(result) {
                popup("Termin: '"+tb+"' am "+tz+" wurde gespeichert!");
            }
        });
    }
}

function writeTermine(data)
{
    var zt = data[0];
    var vt = data[1];
    var print = '';
    if (zt.length != 0)
    {
        print += '<div class="terminHeadline">Aktive Termine</div>';
        print += '<table class="tableTermin" cellspacing="0" cellpadding="4">';
        print += '<tr class="line lineHeader"><th class="spalteLinksTermine">Bezeichnung</th><th class="spalteRechtsTermine">Termin</th></tr>';
        for (var i = 0; i < zt.length; i++)
        {
            print += '<tr onclick="changeToEvent('+zt[i][3]+')" class="line lineContent lineHover link"><td class="spalteLinksTermine">' + zt[i][0] +'</td><td class="spalteRechtsTermine">'+zt[i][1] +'</td></tr>';
        }
        print += '</table>';
    }
    if (vt.length != 0)
    {
        print += '<div class="terminHeadline">Vergangene Termine</div>';
        print += '<table class="tableTermin" cellspacing="0" cellpadding="4">';
        print += '<tr class="line lineHeader"><th class="spalteLinksTermine">Bezeichnung</th><th class="spalteRechtsTermine">Termin</th></tr>';
        for (var i = 0; i < vt.length; i++)
        {
            print += '<tr onclick="changeToEvent('+vt[i][3]+')" class="line lineContent lineHover link"><td class="spalteLinksTermine">' + vt[i][0] +'</td><td class="spalteRechtsTermine">'+vt[i][1] +'</td></tr>';
        }
        print += '</table>';
    }
    $("#otherContent").html(print);
}

function changeToEvent(idi)
{
    id = idi;
    source2 = new EventSource("server.php?f="+7+"&id="+id);

    source2.addEventListener("newStimme", function(e) {
        if (mode == 'e')
        {
            writeStimmen(JSON.parse(e.data));
        }
    }, false);
    
    loading();
    window.location.hash = "#events";
    mode = 'e';
    if (loggedIn)
    {
        writeEventStop();
    } 
    writeUserEventInput();   
}

function changeToTermine()
{
    if(mode != 't'){
        id = 0;
        mode = 't';
        source2.close();
        if (loggedIn)
        {
            writeSetTermine();
        } 
        loading();
        if (menu)
        {
            writeTermine(menu);
        }
        $("#headline").html('Termine');
        $("#userInput").html("");
    }
}

function loading()
{
    $("#otherContent").html('<div class="loader"><img alt="loading" width="50px" height="50px" src="images/loader.gif"><br/>Daten werden geladen...</div>');
}

function writeUserEventInput()
{
    var print = '<table><tr><td>Name:</td><td><input type="text" id="name" class="inputText" /></td><td>Uhrzeit:</td><td><input type="text" class="timepicker inputText" maxlength="5" size="5" id="time"/></td><td><input type="submit" class="button" onclick="setNewStimme()" value="Hinzufügen"/></td></tr></table>'
    $("#userInput").hide();
    $("#userInput").html(print);
    $('.timepicker').timepicker({   
        timeOnlyTitle: 'Uhrzeit',
        timeText: 'Uhrzeit',
        hourText: 'Stunde',
        minuteText: 'Minute',
        secondText: 'Sekunde',
        currentText: 'Jetzt',
        closeText: 'Schließen'
    });
}

function setNewStimme()
{
    var name = $("#name").val();
    var time = $("#time").val();
    if (name != "" && time != "")
    {
        jQuery.ajax({
            url: "server.php?f=6",
            type: "POST",
            data: {
                id: id, 
                name: name, 
                time: time
            },
            dataType: "json",
            success: function(result) {
                if(result == 1)
                {
                    $("#userInput").html("");
                    popup("Ihre Stimme wurde angenommen!");
                }
                else
                {
                    popup("Jeder Benutzer darf nur eine Stimme abgeben!");
                }
            }
        });
    }
}

function writeStimmen(data)
{
    var time = data[0];
    if (time != 0)
    {
        $("#userInput").html("Schaber ist um "+time+" gekommen");
        $("#logedinArea").html("");
    }
    $("#userInput").show();
    var ns = data[1];
    var ls = data[2];
    var ws = data[3];
    var bez = data[4];
    var zeit = data[5];
    var print = '';
    $("#headline").html(bez+' am '+zeit);
    var noc = true;
    if (ws.length != 0)
    {
        noc = false;
        print += '<div class="terminHeadline">Gewinner</div>';
        print += '<table class="tableTermin" cellspacing="0" cellpadding="4">';
        print += '<tr class="line lineHeader"><th class="spalteLinksTermine">Name</th><th class="spalteRechtsTermine">Uhrzeit</th></tr>';
        for (var i = 0; i < ws.length; i++)
        {
            print += '<tr class="line lineContent"><td class="spalteLinksTermine">' + ws[i][0] +'</td><td class="spalteRechtsTermine">'+ws[i][1] +'</td></tr>';
        }
        print += '</table>';
    }
    if (ns.length != 0)
    {
        noc = false;
        print += '<div class="terminHeadline">Aktive</div>';
        print += '<table class="tableTermin" cellspacing="0" cellpadding="4">';
        print += '<tr class="line lineHeader"><th class="spalteLinksTermine">Name</th><th class="spalteRechtsTermine">Uhrzeit</th></tr>';
        for (var i = 0; i < ns.length; i++)
        {
            print += '<tr class="line lineContent"><td class="spalteLinksTermine">' + ns[i][0] +'</td><td class="spalteRechtsTermine">'+ns[i][1] +'</td></tr>';
        }
        print += '</table>';
    }
    if (ls.length != 0)
    {
        noc = false;
        print += '<div class="terminHeadline">Verlierer</div>';
        print += '<table class="tableTermin" cellspacing="0" cellpadding="4">';
        print += '<tr class="line lineHeader"><th class="spalteLinksTermine">Name</th><th class="spalteRechtsTermine">Uhrzeit</th></tr>';
        for (var i = 0; i < ls.length; i++)
        {
            print += '<tr class="line lineContent"><td class="spalteLinksTermine">' + ls[i][0] +'</td><td class="spalteRechtsTermine">'+ls[i][1] +'</td></tr>';
        }
        print += '</table>';
    }
    
    if (noc)
    {
        print += '<br/>Bisher wurden für diesen Termin keine Stimmen abgegeben!<br/><br/>';
    }
    
    print += '<br/><a onclick="changeToTermine()" class="link back">Zurück</a>';
    
    $("#otherContent").html(print);
}

function zeitanzeige()
{
    d = new Date ();
    h = (d.getHours () < 10 ? '0' + d.getHours () : d.getHours ());
    m = (d.getMinutes () < 10 ? '0' + d.getMinutes () : d.getMinutes ());
    s = (d.getSeconds () < 10 ? '0' + d.getSeconds () : d.getSeconds ());
    $('#timeView').html("Uhrzeit: "+h+":"+m+":"+s);
}


//Popup dialog  
function popup(message) {  
          
    // get the screen height and width    
    var maskHeight = $(document).height();    
    var maskWidth = $(window).width();  
      
    // calculate the values for center alignment  
    if (maskHeight > $('#dialog-box').height())
    {
        var dialogTop =  (maskHeight - $('#dialog-box').height())/6;  
    }
    else
    {
        var dialogTop = 15;
    }
    var dialogLeft = (maskWidth/2) - ($('#dialog-box').width()/2);   
      
    // assign values to the overlay and dialog box  
    $('#dialog-overlay').css({
        height:maskHeight, 
        width:maskWidth
    }).show();  
    $('#dialog-box').css({
        top:dialogTop, 
        left:dialogLeft
    }).show();  
      
    // display the message  
    $('#dialog-message').html(message);  
              
}