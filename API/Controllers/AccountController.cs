using System.Security.Claims;
using API.Services;
using Application.Account.DTOs;
using Application.Core.Interfaces;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

public class AccountController(
    UserManager<AppUser> userManager,
    TokenService tokenService,
    IEmailService emailService,
    IConfiguration config)
    : BaseApiController
{
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email)!);
        if (user == null) return Unauthorized();

        return new UserDto
        {
            Username = user.UserName!,
            Email = user.Email!,
            Token = tokenService.CreateToken(user)
        };
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
            Token = tokenService.CreateToken(user)
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
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        var user = new AppUser
        {
            UserName = registerDto.Username,
            Email = registerDto.Email
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded) return BadRequest(result.Errors);

        return new UserDto
        {
            Username = user.UserName!,
            Email = user.Email!,
            Token = tokenService.CreateToken(user)
        };
    }
}
