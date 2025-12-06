<?php 
    session_start();

    if (!isset($_SESSION['username'])) {
        $_SESSION['msg'] = "You must log in first";
        header('location: login.php');
    }

    if (isset($_GET['logout'])) {
        session_destroy();
        unset($_SESSION['username']);
        header('location: login.php');
    }

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Page</title>

    <link rel="stylesheet" href="style1.css">
</head>
<body>
    
    <div class="homeheader">
        <h2>Home Page</h2>
    </div>

    <div class="homecontent">
        <!--  notification message -->
        <?php if (isset($_SESSION['success'])) : ?>
            <div class="success">
                <h3>
                    <?php 
                        echo $_SESSION['success'];
                        unset($_SESSION['success']);
                    ?>
                </h3>
            </div>
        <?php endif ?>
        <!-- logged in user information -->
        <div class="welcome">
            <?php if (isset($_SESSION['username'])) : ?>
                <div class="dashboard">
                    <a href="dashboard.html" class="button">Mashroom Dashboard</a>
                </div>
                <a href="index.php?logout='1'" class="logout-button">Logout</a>
                <p>Welcome <strong><?php echo $_SESSION['username']; ?></strong></p>
                <p>🍄‍🟫Mashroom Dashboard By Natnaree and Jirawat🍄‍🟫</p>
            <?php endif ?>
        </div> 
    </div>

</body>
</html>