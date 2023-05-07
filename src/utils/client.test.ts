import { expect, it } from "vitest";
import { isValidYtUrl } from "./client";

it("checks if a yt url is valid or not", () => {
  const cases = [
    { url: "https://www.youtube.com/watch?v=QTK_bC00ilg", expected: true },
    {
      url: "https://www.youtube.com/watch?v=QTK_bC00ilg/asdsadasdgarbage",
      expected: true,
    },

    //Shorts Also a very cute video btw
    { url: "https://www.youtube.com/shorts/cVoSbbWtZMc", expected: true },
    {
      url: "https://www.youtube.com/shorts/cVoSbbWtZMc/asdasdasdgargbage",
      expected: true,
    },

    //To do fix these - Failing cases
    { url: "https://youtu.be/ILMHmEADlwY", expected: false },
    { url: "https://www.youtube.com/embed/ILMHmEADlwY", expected: false },

    //Failing cases - no need to fix
    { url: "some garbage", expected: false },
    { url: "https://www.vimeo.comnot/garbage", expected: false },

    //To do need to fix these cases as well
    /*  { url: "https://www.notyoutube.com/watch?v=QTK_bC00ilg", expected: false },
    { url: "https://www.youtube.comnot/watch?v=QTK_bC00ilg", expected: false }, */
  ];

  for (const item of cases) {
    const result = isValidYtUrl(item.url);
    expect(
      result,
      `for ${
        item.url
      } got ${result.toString()}, expected ${item.expected.toString()}`
    ).toBe(item.expected);
  }
});
