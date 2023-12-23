namespace API.Modules.MailsModule.Models;

public class MailPatterns
{
    public static string PasswordRecoveryPattern = @"<h1>Восстановление пароля</h1>
<p>Здравствуйте, {login}. Для смены пароля, нажмите на <a href={url}>кнопку</a>.</p>";

    public static string VerificationPattern = @"<h1>Подтверждение аккаунта</h1>
<p>Здравствуйте, {login}. Для вас зарегистрировали аккаунт на платформе {host}. 
Для подтверждения аккаунта и установки пароля, нажмите на <a href={url}>кнопку</a>.
</p>";
}