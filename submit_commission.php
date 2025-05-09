php
<?php

// This script receives POST data from the commission form.

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Access form data using $_POST superglobal
    $fursona_name = $_POST['fursona_name'] ?? ''; // Use null coalescing operator for safer access
    $discord_username = $_POST['discord_username'] ?? '';
    $commission_type = $_POST['commission_type'] ?? '';
    $new_models = $_POST['new_models'] ?? 0;
    $custom_texture = isset($_POST['custom_texture']) ? 'Yes' : 'No';
    $scene_reuse = isset($_POST['scene_reuse']) ? 'Yes' : 'No';
    $avatar_price = $_POST['avatar_price'] ?? ''; // Assuming you added an input for this

    // -----------------------------------------------------------------------
    // EMAIL SENDING LOGIC GOES HERE
    // You will need to configure your server to send emails or use a library/service.
    // Example: using the mail() function (requires server configuration)
    /*
    $to = 'your_email@gmail.com'; // Replace with your Gmail address
    $subject = 'New Commission Request from ' . $fursona_name;
    $message = "Fursona / Name: " . $fursona_name . "\n";
    $message .= "Discord UserName: " . $discord_username . "\n";
    $message .= "Commission Type: " . $commission_type . "\n";
    $message .= "Number of New Models: " . $new_models . "\n";
    $message .= "Custom Texture Needed: " . $custom_texture . "\n";
    $message .= "Allow Scene Reuse: " . $scene_reuse . "\n";
    if (!empty($avatar_price)) {
        $message .= "Avatar Price: $" . $avatar_price . "\n";
        // You would calculate the license cost here based on $avatar_price
    } else {
         $message .= "Avatar Price Not Provided (default licensing cost applied in HTML estimate)\n";
    }
    // You might want to add the calculated estimated cost from the form here too

    $headers = 'From: your_website@yourdomain.com' . "\r\n" . // Replace with your website email
               'Reply-To: ' . $discord_username . '@discord' . "\r\n" . // Example reply-to
               'X-Mailer: PHP/' . phpversion();

    if (mail($to, $subject, $message, $headers)) {
        // Email sent successfully
        echo "Thank you for your commission request!";
    } else {
        // Email sending failed
        echo "There was an error sending your request. Please try again later.";
    }
    */
    // -----------------------------------------------------------------------

    // -----------------------------------------------------------------------
    // FILE UPLOAD HANDLING LOGIC GOES HERE
    // You will need to process the uploaded file(s) using $_FILES
    // and move them to a secure location on your server.
    // Example: handling a single file upload input with name="blender_asset"
    /*
    if (isset($_FILES['blender_asset']) && $_FILES['blender_asset']['error'] === UPLOAD_ERR_OK) {
        $file_tmp_path = $_FILES['blender_asset']['tmp_name'];
        $file_name = $_FILES['blender_asset']['name'];
        $upload_dir = '/path/to/your/upload/directory/'; // Replace with your actual upload directory

        // You should validate file type, size, etc. before moving
        $destination = $upload_dir . $file_name;

        if (move_uploaded_file($file_tmp_path, $destination)) {
            // File uploaded successfully
            // You might want to store the file path in your database or email
            echo " File uploaded successfully.";
        } else {
            // File upload failed
            echo " There was an error uploading your file.";
        }
    } else {
        // No file uploaded or an error occurred
        // echo " No file was uploaded.";
    }
    */
    // -----------------------------------------------------------------------

    // Basic confirmation message (you'll likely redirect the user after successful processing)
    echo "Form submitted successfully! (Email and file upload logic not yet implemented)";

} else {
    // If the request method is not POST, redirect or show an error
    header("Location: index.html"); // Redirect to your homepage
    exit();
}

?>