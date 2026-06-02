using System;

namespace Application.Account.DTOs;

public class UserDto
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Token { get; set; } = "";
    public bool ReminderEnabled { get; set; }
}
