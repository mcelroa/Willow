namespace Application.Questions.DTOs;

public class QuestionDto
{
    public required string Id { get; set; }
    public required string Text { get; set; }
    public bool IsAsked { get; set; }
    public DateOnly CreatedAt { get; set; }
}
