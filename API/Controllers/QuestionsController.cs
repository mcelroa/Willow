using Application.Questions.Commands;
using Application.Questions.DTOs;
using Application.Questions.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class QuestionsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<QuestionDto>>> GetQuestions()
    {
        return HandleResult(await Mediator.Send(new GetQuestionList.Query()));
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateQuestion(CreateQuestionDto dto)
    {
        return HandleResult(await Mediator.Send(new CreateQuestion.Command { Dto = dto }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuestion(string id)
    {
        return HandleResult(await Mediator.Send(new DeleteQuestion.Command { Id = id }));
    }

    [HttpPatch("{id}/mark-asked")]
    public async Task<IActionResult> MarkAsked(string id)
    {
        return HandleResult(await Mediator.Send(new MarkAsked.Command { Id = id }));
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<List<string>>> GetSuggestions()
    {
        return HandleResult(await Mediator.Send(new GetQuestionSuggestions.Query()));
    }
}
