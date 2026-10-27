namespace Avond4Daagse.Services
{
    public static class PasswordService
    {
        private const int WorkFactor = 12;

        public static string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: WorkFactor);
        }

        public static bool Verify(string password, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
    }
}