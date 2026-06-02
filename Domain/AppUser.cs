using Microsoft.AspNetCore.Identity;

namespace Domain;

public class AppUser : IdentityUser
{
    public bool ReminderEnabled { get; set; } = false;
}
