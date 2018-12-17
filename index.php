<!DOCTYPE html>
<html lang="de">
    <head>
        <meta name="description" content="Stimme ab, wann Dir. Mag. Harald Schaber in den Unterricht kommt!">
        <meta name="keywords" content="Schaber, Wetten">
        <meta name="author" content="Valentin Giselbrecht">
        <meta charset="utf-8" />
        <meta property="og:title" content="Schaber Wetten" />
        <meta property="og:description" content="Stimme ab, wann Dir. Mag. Harald Schaber in den Unterricht kommt!" />
        <meta property="og:url" content="http://schaber-wetten.gise.at/" />
        <meta property="og:image" content="http://schaber-wetten.gise.at/images/og.png" />
        <title>Schaber Wetten [Beta]</title>
        <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
        <link rel="icon" href="images/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" type="text/css" href="style.css">
        <link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css">
        <script language="JavaScript" type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.js"></script>
        <script language="JavaScript" type="text/javascript" src="http://code.jquery.com/ui/1.10.2/jquery-ui.js"></script>
        <script language="JavaScript" type="text/javascript" src="jquery-gsf.js"></script>
        <script language="JavaScript" type="text/javascript" src="script.js"></script>
        <script language="JavaScript" type="text/javascript" src="jquery-ui-timepicker-addon.js"></script>
    </head>
    <body>
        <header>
            <h1>Schaber Wetten [Beta]</h1>
            <h2>Stimme ab, wann Dir. Mag. Harald Schaber in den Unterricht kommt!</h2>
        </header>
        <div id="main">
            <div id="logedinArea"></div>
            <div id="timeView"></div>
            <div id="headline">Termine</div>
            <div id="userInput"></div>
            <div id="otherContent"></div> 
        </div>
        <footer>
            Entwickler: <a target="_blank" href="http://www.gise.at">Valentin Giselbrecht</a> | <span id="loginLogout"><a class="link" onclick="writeLoginScreen()">Login</a></span>
        </footer>
        <div id="dialog-overlay"></div>  
        <div id="dialog-box">  
            <div class="dialog-content">  
                <div id="dialog-message"></div>  
                <a class="buttonDia link">Schließen</a>  
            </div>  
        </div>  
        <!--[if IE]><div style="position:fixed;top:0;left:0;right:0;bottom:0;background:black;z-index:999999999;text-align:center;color:white">
                  Ihr Browser wird nicht Unterstützt!</div>
        <![endif]-->
    </body>
</html>