using Application.Core;
using Application.Core.Interfaces;
using Application.Sharing.DTOs;
using AutoMapper;
using Domain;
using MediatR;
using Persistence;
using System.Security.Cryptography;

namespace Application.Sharing.Commands;

public class CreateShareLink
{
    public class Command : IRequest<Result<ShareLinkDto>>
    {
        public string? Label { get; set; }
        public DateOnly? ExpiresAt { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<ShareLinkDto>>
    {
        public async Task<Result<ShareLinkDto>> Handle(Command request, CancellationToken cancellationToken)
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = Base64UrlEncode(tokenBytes);

            var shareLink = new ShareLink
            {
                Token = token,
                Label = request.Label,
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                ExpiresAt = request.ExpiresAt,
                UserId = userAccessor.GetUserId(),
            };

            context.ShareLinks.Add(shareLink);

            var success = await context.SaveChangesAsync(cancellationToken) > 0;
            if (!success) return Result<ShareLinkDto>.Failure("Failed to create share link", 400);

            return Result<ShareLinkDto>.Success(mapper.Map<ShareLinkDto>(shareLink));
        }

        private static string Base64UrlEncode(byte[] bytes) =>
            Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
    }
}
