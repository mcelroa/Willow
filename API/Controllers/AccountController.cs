using System.Security.Claims;
using API.Services;
using Application.Account.DTOs;
using Application.Core.Interfaces;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.RateLimiting;
using Persistence;

namespace API.Controllers;

public class AccountController(
    UserManager<AppUser> userManager,
    TokenService tokenService,
    IEmailService emailService,
    IConfiguration config,
    AppDbContext context,
    IWebHostEnvironment env,
    ILogger<AccountController> logger)
    : BaseApiController
{
    [Authorize]
    [HttpPatch("settings")]
    public async Task<ActionResult<UserDto>> UpdateSettings(UpdateSettingsDto dto)
    {
        var user = await userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email)!);
        if (user == null) return Unauthorized();

        user.ReminderEnabled = dto.ReminderEnabled;
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest("Failed to update settings");

        return new UserDto
        {
            Username = user.UserName!,
            Email = user.Email!,
            Token = tokenService.CreateToken(user),
            ReminderEnabled = user.ReminderEnabled
        };
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email)!);
        if (user == null) return Unauthorized();

        var result = await userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded) return BadRequest("Current password is incorrect");

        return Ok();
    }

    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var user = await userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email)!);
        if (user == null) return Unauthorized();

        context.CheckIns.RemoveRange(context.CheckIns.Where(c => c.UserId == user.Id));
        context.Questions.RemoveRange(context.Questions.Where(q => q.UserId == user.Id));
        await context.SaveChangesAsync();

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded) return BadRequest("Failed to delete account");

        return NoContent();
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email)!);
        if (user == null) return Unauthorized();
        if (!user.EmailConfirmed) return Unauthorized();

        return new UserDto
        {
            Username = user.UserName!,
            Email = user.Email!,
            Token = tokenService.CreateToken(user),
            ReminderEnabled = user.ReminderEnabled
        };
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null) return BadRequest("Invalid verification link");

        var result = await userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded) return BadRequest("Invalid or expired verification link");

        return Ok();
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);
        if (user == null) return Unauthorized();

        var result = await userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!result) return Unauthorized();

        return new UserDto
        {
            Username = user.UserName!,
            Email = user.Email!,
            Token = tokenService.CreateToken(user),
            ReminderEnabled = user.ReminderEnabled
        };
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth-strict")]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return Ok();

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var clientUrl = config["ClientUrl"];
        var resetLink = $"{clientUrl}/reset-password?email={Uri.EscapeDataString(dto.Email)}&token={encodedToken}";

        await emailService.SendPasswordResetAsync(dto.Email, resetLink);
        if (env.IsDevelopment()) logger.LogInformation("Password reset link: {ResetLink}", resetLink);
        return Ok();
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return BadRequest("Invalid request");

        var result = await userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded) return BadRequest("Invalid or expired reset link");

        return Ok();
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var user = new AppUser
        {
            UserName = registerDto.Username,
            Email = registerDto.Email
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var clientUrl = config["ClientUrl"];
        var verifyLink = $"{clientUrl}/verify-email?email={Uri.EscapeDataString(registerDto.Email)}&token={encodedToken}";

        await emailService.SendEmailVerificationAsync(registerDto.Email, verifyLink);
        if (env.IsDevelopment()) logger.LogInformation("Email verification link: {VerifyLink}", verifyLink);

        return Ok();
    }
}
