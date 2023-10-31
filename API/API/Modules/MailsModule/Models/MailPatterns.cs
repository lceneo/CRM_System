namespace API.Modules.MailsModule.Models;

public class MailPatterns
{
    public static string PasswordRecoveryPattern => _passwordRecoveryPattern;
    public static string VerificationPattern => verifictionPattern;
    
    private static string _passwordRecoveryPattern = @"<h1>Восстановление пароля</h1>
<p>Здравствуйте, {login}. Для смены пароля, нажмите на <a href={url}>кнопку</a>.</p>";

    private static string verifictionPattern = @"<h1>Подтверждение аккаунта</h1>
<p>Здравствуйте, {login}. Для вас зарегистрировали аккаунт на платформе {host}. 
Для подтверждения аккаунта и установки пароля, нажмите на <a href={url}>кнопку</a>.
</p>";
}