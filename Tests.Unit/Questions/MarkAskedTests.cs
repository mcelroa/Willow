using Application.Core.Interfaces;
using Application.Questions.Commands;
using Domain;
using Microsoft.EntityFrameworkCore;
using Moq;
using Persistence;

namespace Tests.Unit.Questions;

public class MarkAskedTests
{
    private AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static IUserAccessor MockUserAccessor(string userId)
    {
        var mock = new Mock<IUserAccessor>();
        mock.Setup(x => x.GetUserId()).Returns(userId);
        return mock.Object;
    }

    [Fact]
    public async Task Handle_SetsIsAskedTrue_WhenOwner()
    {
        var context = CreateContext();
        var question = new Question { UserId = "user-1", Text = "Any diet restrictions?", CreatedAt = new DateOnly(2025, 1, 1) };
        context.Questions.Add(question);
        await context.SaveChangesAsync();

        var handler = new MarkAsked.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new MarkAsked.Command { Id = question.Id }, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(context.Questions.Single().IsAsked);
    }

    [Fact]
    public async Task Handle_Returns404_WhenQuestionNotFound()
    {
        var context = CreateContext();

        var handler = new MarkAsked.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new MarkAsked.Command { Id = "nonexistent-id" }, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(404, result.Code);
    }

    [Fact]
    public async Task Handle_Returns404_WhenNotOwner()
    {
        var context = CreateContext();
        var question = new Question { UserId = "user-2", Text = "What does this mean?", CreatedAt = new DateOnly(2025, 1, 1) };
        context.Questions.Add(question);
        await context.SaveChangesAsync();

        var handler = new MarkAsked.Handler(context, MockUserAccessor("user-1"));
        var result = await handler.Handle(
            new MarkAsked.Command { Id = question.Id }, CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(404, result.Code);
        Assert.False(context.Questions.Single().IsAsked);
    }
}
