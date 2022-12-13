
const batch_draw = function () {
    let file_path = "../../../data/Vaccine_Hesitancy.csv";
    draw_plot1(file_path)
    draw_plot2(file_path)
    draw_plot3("../../data/vaccine_rollout.csv")
    draw_plot4(file_path)
    draw_plot5(file_path)
    // draw_plot6(file_path)
}


let draw_plot1 = function (file_path) {

    // Select out the only row that I need
    let rowConverter = data => {
        return {
            SVI_index: parseFloat(data["Social Vulnerability Index (SVI)"]),
            estimated_hesitant: parseFloat(data["Estimated hesitant"]),
            estimated_strongly_hesitant: parseFloat(data["Estimated strongly hesitant"]),
            estimated_hesitant_unsure: parseFloat(data["Estimated hesitant or unsure"])
        }
    }

    data = d3.csv(file_path, rowConverter)

    data.then(data => {
        let svgHeight = 800
        let svgWidth = 800
        let padding = 60

        // Create a new SVG
        let svg = d3.select("#plot1").append("svg")
            .attr("width", svgWidth).attr("height", svgHeight);

        // Manually create the scale. I hardcoded the scale because they are
        // proportion and easily computed
        let xScale = d3.scaleLinear().domain([-0.02, 1])
            .range([padding, svgWidth-padding])
        let yScale = d3.scaleLinear().domain([0, 0.35])
            .range([svgHeight-padding, padding])


        // append the axis
        let xAxis = d3.axisBottom().scale(xScale);
        let yAxis = d3.axisLeft().scale(yScale);
        svg.append("g").call(xAxis).attr("class", "xAxis")
            .attr("transform", `translate(0, ${svgHeight-padding})`);
        svg.append("g").call(yAxis).attr("class", "yAxis")
            .attr("transform", `translate(${padding}, 0)`);

        let cat = "estimated_hesitant_unsure"

        // Concatenate them together for regression
        let xyData = data.map(d=>{return [d.SVI_index, d[cat]]})

        // Compute the regression line
        // Weirdly larger dataset will casues the regression failed.
        let regression = ss.linearRegression(xyData.slice(0,1000))

        // Append the dot
        svg.selectAll("circle").data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.SVI_index))
            .attr("cy", d => yScale(d[cat]))
            .attr("r", 3)
            .attr("fill", "plum")
            .attr("opacity", 0.5);

        // Calculate the regression line
        let lr_line = ss.linearRegressionLine(regression);
        let lr_points = [{x:0, y:lr_line(0)}, {x:1, y:lr_line(1)}]
        let line = d3.line().x(d=>xScale(d.x)).y(d=>yScale(d.y))

        // Plot the regression line
        svg.append("path").datum(lr_points).attr("d", line)
            .attr("class", "regression")
            .style("stroke", "hotpink")
            .style("stroke-width", 2)

        // Add the labels
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - 20 )
            .attr("font-size", 20)
            .text("Social Vulnerability Index");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", -svgWidth/2)
            .attr("y", 10)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .attr("font-size", 20)
            .text("Vaccine Hesitancy Rating");


        // handle the changing category of the vis
        let change_cat = (category) => {
            cat = category.target.value
            console.log(cat);
            svg.selectAll(".dot")
                .attr("cy", d=>yScale(d[cat]))

            // Concatenate them together for regression
            let xyData = data.map(d=>{return [d.SVI_index, d[cat]]})

            // Compute the regression line
            // Weirdly larger dataset will casues the regression failed.
            let regression = ss.linearRegression(xyData.slice(0,1000))

            // Draw the regression line
            let lr_line = ss.linearRegressionLine(regression);
            let lr_points = [{x:0, y:lr_line(0)}, {x:1, y:lr_line(1)}]
            let line = d3.line().x(d=>xScale(d.x)).y(d=>yScale(d.y))

            svg.select(".regression").datum(lr_points).attr("d", line)
        }

        d3.select("#radio_plot1").on("change", change_cat)

        // Add the title
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", padding - 20)
            .attr("font-size", 20)
            .text("Social Vulnerability is Positively Correlated with Vaccine Hesitancy Rating");
    })
}

let draw_plot2 = function (file_path) {
    let rowConverter = data => {
        return {
            state_code: data["State Code"],
            estimated_hesitant: parseFloat(data["Estimated hesitant"]),
            estimated_strongly_hesitant: parseFloat(data["Estimated strongly hesitant"]),
            estimated_hesitant_unsure: parseFloat(data["Estimated hesitant or unsure"])
        }
    }

    let data = d3.csv(file_path, rowConverter)

    data.then(data => {

        // console.log(data)

        let sumUp = function (arr) {
            return arr.reduce((a, b) => ({
                    estimated_hesitant: a.estimated_hesitant + b.estimated_hesitant,
                    estimated_strongly_hesitant: a.estimated_strongly_hesitant + b.estimated_strongly_hesitant,
                    estimated_hesitant_unsure: a.estimated_hesitant_unsure + b.estimated_hesitant_unsure
                })
            )
        }

        let byStates = d3.rollup(data, sumUp, d=>d.state_code)
        let byStatesCount = d3.rollup(data, d=>d.length, d=>d.state_code)
        let flatStates = Array.from(byStates, ([name, value]) => ({name, ...value}))

        // Map to normalized the data
        flatStates = flatStates.map(ele => {
            let count = byStatesCount.get(ele.name)
            return {
                state_code: ele.name,
                estimated_hesitant: ele.estimated_hesitant / count,
                estimated_strongly_hesitant: ele.estimated_strongly_hesitant / count,
                estimated_hesitant_unsure: ele.estimated_hesitant_unsure / count
            }
        })

        console.log(flatStates)

        let state_code = flatStates.map(d=>d.state_code).sort()

        console.log(state_code)

        let svgHeight = 700
        let svgWidth = 1000
        let padding = 50

        let svg = d3.select("#plot2").append("svg")
            .attr("width", svgWidth).attr("height", svgHeight);

        let xScale = d3.scaleBand().domain(state_code)
            .range([padding, svgWidth-padding]).paddingInner(0.15)
        let yScale = d3.scaleLinear().domain([0, 0.35])
            .range([svgHeight-padding, padding])

        let xAxis = d3.axisBottom().scale(xScale);
        let yAxis = d3.axisLeft().scale(yScale);

        svg.append("g").call(xAxis).attr("class", "xAxis")
            .attr("transform", `translate(0, ${svgHeight-padding})`);

        svg.append("g").call(yAxis).attr("class", "yAxis")
            .attr("transform", `translate(${padding}, 0)`);

        let tooltip = d3.select("#plot2")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")



        function handleMouseOver(event, d) {
            d3.select(this).transition("be pink").duration(50).style("fill", "#e27c7c")
            tooltip.transition("Show tooltip")
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`State: ${d.state_code} <br> Hesitancy Rate: ${d[cat].toFixed(2)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 45) + "px");
        }

        function handleMouseOut(event, d) {
            d3.select(this).transition("be black").duration(500).style("fill", "#503f3f")
            tooltip.transition("Show tooltip")
                .duration(200)
                .style("opacity", 0);
        }

        function handleMouseMove(event, d) {
            tooltip
                .style("left", (event.pageX+10) + "px")
                .style("top", (event.pageY - 50) + "px");
        }

        let bars = svg.selectAll(".bar").data(flatStates)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(state_code[i]))
            .attr("y", d => yScale(d.estimated_hesitant_unsure))
            .attr("width", xScale.bandwidth())
            .attr("height", d => svgHeight - yScale(d.estimated_hesitant_unsure) - padding)
            .style("fill", "#503f3f")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove)


        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", svgWidth / 2 + 50)
            .attr("font-size", 20)
            .attr("y", svgHeight - 10 )
            .text("State Code");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", -300)
            .attr("y", 0)
            .attr("font-size", 20)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Hesitancy Rate");

        let isDescending = 0;

        let cat = "estimated_hesitant_unsure";

        let sort_func = (a, b) => {
            if (isDescending===0) {
                return b[cat] - a[cat];
            } else if (isDescending === 1) {
                return a[cat] - b[cat]
            } else {
                isDescending = -1;
                return a.state_code.localeCompare(b.state_code)
            }
        }

        let sortBars = function(){

            flatStates.sort(sort_func)
            let sorted_state_code = flatStates.map(d=>d.state_code)
            xScale.domain(state_code)
            // console.log(sorted_state_code)
            svg.selectAll(".bar").sort(sort_func)
                .transition("sorting")
                .duration(1000)
                .attr("x", (d, i) => xScale(state_code[i]));
            xScale.domain(sorted_state_code)

            isDescending++;

            console.log(flatStates)

            svg.select(".xAxis").transition().duration(1000).call(xAxis)
        }

        d3.select("#sort_button").on("click", function(){
            sortBars();
        })

        let change_cat = category => {
            cat = category.target.value
            xScale.domain(state_code)
            svg.selectAll(".bar")
                .transition("change cat")
                .duration(1000)
                .attr("x", (d, i) => xScale(state_code[i]))
                .attr("y", d=>yScale(d[cat]))
                .attr("height", d => svgHeight - yScale(d[cat]) - padding);
            //reset is descending
            isDescending = 0
        }

        d3.select("#radio_plot2").on("change", change_cat)

        // Add the title
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", padding - 20)
            .attr("font-size", 20)
            .text("Explore Different States' Vaccination Hesitancy Rate");

    })
}

let draw_plot3 = function (file_path) {

    let rowConverter = data => {
        if (data.Location === "US") {
            return {
                Date: new Date(data.Date),
                Total_Admin: parseInt(data.Administered),
                Janssen: parseInt(data.Administered_Janssen),
                Moderna: parseInt(data.Administered_Moderna),
                Pfizer: parseInt(data.Administered_Pfizer),
                Unknown: parseInt(data.Administered_Unk_Manuf)
            }
        }
    }


    let data = d3.csv(file_path, rowConverter)

    data.then(data => {
        data = data.reverse()
        console.log(data)

        let svgHeight = 700
        let svgWidth = 1200
        let padding = 90


        let svg = d3.select("#plot3").append("svg").attr("width", svgWidth)
            .attr("height", svgHeight)

        let xScale = d3.scaleLinear().domain(d3.extent(data, function(d) {return d.Date;}))
            .range([padding, svgWidth - padding]);

        let yScale = d3.scaleLinear().domain([0, d3.max(data.map(d=>d.Total_Admin))])
            .range([svgHeight-padding, padding])

        svg.append("g").call(d3.axisBottom(xScale).tickFormat((d, i) => new Date(d).toISOString().split('T')[0]))
            .attr("transform", `translate(0, ${svgHeight-padding})`)

        svg.append("g")
            .call(d3.axisLeft(yScale))
            .attr("transform", `translate(${padding},0)`);

        let keys = ["Janssen", "Moderna", "Pfizer", "Unknown"]

        let color = d3.scaleOrdinal().domain(keys)
            .range(["#7eb0d5","#bd7ebe","#8bd3c7","#b2e061"])



        let stacked = d3.stack().offset(d3.stackOffsetNone).keys(keys)(data)

        console.log(stacked)

        let tooltip = d3.select("#plot2")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")


        // Three function that change the tooltip when user hover / move / leave a cell
        let mouseover = function(event, d) {
            d3.selectAll(".myArea").style("opacity", .2)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        }

        let mouseleave = function(event, d) {
            d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        }


        svg.selectAll("streamGraph").data(stacked)
            .enter().append("path").style("fill", (d, i)=>color(keys[i]))
            .attr("d", d3.area()
                .x((d, i) => xScale(data[i].Date))
                .y0(d=>yScale(d[0]))
                .y1(d=>yScale(d[1]))
            ).attr("class", "myArea")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)

        let size = 20;

        svg.selectAll("legend").data(keys).enter().append('rect')
            .attr("x", 100)
            .attr("y", (d, i) => 100 + i * (size+5))
            .style("fill", d => color(d))
            .attr("width", size)
            .attr("height", size)

        // Add one dot in the legend for each name.
        svg.selectAll("labels")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", 100 + size*1.2)
            .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25
            // is the distance between dots
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .attr("font-family", "Fira Sans")
            .style("alignment-baseline", "middle")

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - padding + 50 )
            .attr("font-size", 20)
            .text("Date");

        svg.append("text")
            .attr("class", "y label")
            .attr("font-size", 20)
            .attr("text-anchor", "middle")
            .attr("x", -svgHeight/2)
            .attr("y", 0)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Administered Dose");

        // Add the title
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", padding - 20)
            .attr("font-size", 20)
            .text("Pfizer & Moderna Makeup the Majority of Administered COVID-19 Vaccine AND Vaccination " +
                "Pace has Slow Down");
    })
}

let draw_plot4 = function (file_path) {
    let rowConverter = data => {
        return {
            CVAC_level: data["CVAC Level Of Concern"],
            SVI_cat: data["SVI Category"],
            fully_vac: parseFloat(data["Percent adults fully vaccinated against COVID-19 (as of 6/10/21)"])
        }
    }

    let data = d3.csv(file_path, rowConverter)

    data.then(data => {
        // console.log(data)

        let CVAC_all_level = ["Very Low Concern", "Low Concern", "Moderate Concern",
            "High Concern", "Very High Concern"]
        let SVI_all_cat = ["Very Low Vulnerability", "Low Vulnerability",
            "Moderate Vulnerability", "High Vulnerability", "Very High Vulnerability"]

        // Grouping them together.
        let grouped = d3.rollup(data, d=>d, d=>d.CVAC_level, d=>d.SVI_cat)

        let flatted_data = []

        CVAC_all_level.forEach(CVAC_level => {
            SVI_all_cat.forEach(SVI_cat => {
                let vac_rate = grouped.get(CVAC_level).get(SVI_cat).map(d=>d.fully_vac)
                // console.log(vac_rate)
                let count = 0
                let total = 0
                vac_rate.forEach(vac => {
                    if (!isNaN(vac)) {
                        count++
                        total += vac
                    }
                })
                if (count===0) {
                    count = 1
                }
                flatted_data.push({
                    CVAC_level: CVAC_level,
                    SVI_cat: SVI_cat,
                    fully_vac: total/count
                })
            })
        })

        console.log(flatted_data)


        let svgWidth = 900;
        let svgHeight = 900;
        let padding = 130;

        let svg = d3.select("#plot4").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)

        let xScale = d3.scaleBand().range([padding, svgWidth-padding])
            .domain(CVAC_all_level)
            .padding(0.03)
        svg.append("g")
            .attr("transform", "translate(0," + (svgHeight - padding) + ")")
            .call(d3.axisBottom(xScale))

        // Build X scales and axis:
        let yScale = d3.scaleBand()
            .range([svgHeight-padding, padding])
            .domain(SVI_all_cat)
            .padding(0.03);
        svg.append("g")
            .attr("transform", `translate(${padding},0)`)
            .call(d3.axisLeft(yScale))


        // Build color scale
        let colorScale = d3.scaleLinear()
            .range(["white", "#69b3a2"])
            .domain([0.2, 0.6])

        // create a tooltip
        let tooltip = d3.select("#plot4")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        function handleMouseOver(event, d) {
            d3.select(this).style("stroke-width", 10)
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            console.log(d)
            let text
            if (d.fully_vac !== 0) {
                text = `The Fully Vaxxed Rate: <br> ${d.fully_vac.toFixed(2)}`
            } else {
                text = `No Data Available for this Category`
            }
            tooltip.html(text)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 45) + "px");
        }

        function handleMouseOut(event, d) {
            d3.select(this).transition()
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        }

        function handleMouseMove(event, d) {
            tooltip
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 45) + "px");
        }

        svg.selectAll("square").data(flatted_data).enter()
            .append("rect")
            .attr("x", d=>xScale(d.CVAC_level))
            .attr("y", d=>yScale(d.SVI_cat))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", function(d) { return colorScale(d.fully_vac)} )
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("mousemove", handleMouseMove)

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", xScale("Very High Concern") + xScale.bandwidth() / 2)
            .attr("y", yScale("Very Low Vulnerability") + yScale.bandwidth()/2)
            .text("N/A");

        // Add the labels
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - padding + 50)
            .attr("font-size", 20)
            .text("Level of Vaccine Rollout Concern ");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", -svgHeight/2)
            .attr("y", 0)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .attr("font-size", 20)
            .text("Social Vulnerability Index Category");

        // Add the title
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", padding - 20)
            .attr("font-size", 20)
            .text("High Social Vulnerability Coupled with Low Concern of Vaccine Rollout has High Vaccination Rate");

    })
}

let draw_plot5 = function (file_path) {

    let rowConverter = data => {
        return {
            SVI_cat: data["SVI Category"],
            Hesitant: parseFloat(data["Estimated hesitant"])
        }
    }

    let data = d3.csv(file_path, rowConverter)

    data.then(data => {
        console.log(data)

        let SVI_all_cat = ["Very Low Vulnerability", "Low Vulnerability",
            "Moderate Vulnerability", "High Vulnerability", "Very High Vulnerability"]

        let svgWidth = 900;
        let svgHeight = 900;
        let padding = 50;

        let svg = d3.select("#plot5").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)

        // Proper scaling
        let xScale = d3.scaleBand().range([padding, svgWidth-padding])
            .domain(SVI_all_cat)
            .paddingInner(0.2)
        svg.append("g")
            .attr("transform", "translate(0," + (svgHeight - padding) + ")")
            .call(d3.axisBottom(xScale))
        let yScale = d3.scaleLinear().domain([0, 0.30])
            .range([svgHeight-padding, padding])
        svg.append("g")
            .attr("transform", `translate(${padding}, 0)`)
            .call(d3.axisLeft(yScale))


        // Compute quartiles, median, inter quantile range min and max
        let sum_func = d => {
            let q1 = d3.quantile(d.map(function (g) {
                return g.Hesitant;
            }).sort(d3.ascending), .25)
            let median = d3.quantile(d.map(function (g) {
                return g.Hesitant;
            }).sort(d3.ascending), .5)
            let q3 = d3.quantile(d.map(function (g) {
                return g.Hesitant;
            }).sort(d3.ascending), .75)
            let interQuantileRange = q3 - q1
            let min = q1 - 1.5 * interQuantileRange
            let max = q3 + 1.5 * interQuantileRange
            return ({q1: q1, median: median, q3: q3,
                interQuantileRange: interQuantileRange, min: min, max: max})
        }

        let sumStat = d3.rollup(data,sum_func, d=>d.SVI_cat)

        let grouped = d3.rollup(data, d=>d, d=>d.SVI_cat)

        grouped = Array.from(grouped, ([SVI_cat, data]) => ({SVI_cat, data}))
        console.log(grouped)

        // flatted the sumStat:

        sumStat = Array.from(sumStat, ([SVI_cat, Stats]) => ({SVI_cat, ...Stats}))

        sumStat.pop()

        console.log(sumStat)

        // Show the main vertical line
        svg
            .selectAll("vertLines")
            .data(sumStat)
            .enter()
            .append("line")
            .attr("x1", d=>xScale(d.SVI_cat) + xScale.bandwidth()/2)
            .attr("x2", d=>xScale(d.SVI_cat)+ xScale.bandwidth()/2)
            .attr("y1", d=>yScale(d.min))
            .attr("y2", d=>yScale(d.max))
            .attr("stroke", "black")
            .style("width", 40)

        // rectangle for the main box
        svg
            .selectAll("boxes")
            .data(sumStat)
            .enter()
            .append("rect")
            .attr("x", d=>xScale(d.SVI_cat))
            .attr("y", d=>yScale(d.q3))
            .attr("height", d=>yScale(d.interQuantileRange)-yScale(d.q3))
            .attr("width", xScale.bandwidth())
            .attr("stroke", "black")
            .style("fill", "#7eb0d5")
            .style("opacity", 0.9)

        // Show the median
        svg
            .selectAll("medianLines")
            .data(sumStat)
            .enter()
            .append("line")
            .attr("x1", d=>xScale(d.SVI_cat))
            .attr("x2", d=>xScale(d.SVI_cat) + xScale.bandwidth())
            .attr("y1", d=>yScale(d.median))
            .attr("y2", d=>yScale(d.median))
            .attr("stroke", "black")

        // Add individual points with jitter Math.random()*jitterWidth
        let jitterWidth = 50
        svg
            .selectAll("indPoints")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d=> xScale(d.SVI_cat) + Math.random()*jitterWidth
                + xScale.bandwidth()/2 - jitterWidth/2)
            .attr("cy", d=> yScale(d.Hesitant))
            .attr("r", 4)
            .style("fill", "white")
            .attr("stroke", "black")
            .style("opacity", 0.5)

        // Add the labels
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", svgHeight - padding + 50)
            .attr("font-size", 20)
            .text("Level of Social Vulnerability");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", -svgHeight/2)
            .attr("y", 0)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .attr("font-size", 20)
            .text("Hesitancy about take the vaccine");

        // Add the title
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", padding/2)
            .attr("font-size", 20)
            .text("High Social Vulnerability Tend to Have Higher Hesitancy Regarding COVID-19 Vaccine");


    })
}