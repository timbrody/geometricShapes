/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import * as d3 from "d3";
import { curveCardinalClosed } from "d3";
import { Color } from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private textNode: Text;
    private svg: Selection<SVGElement>;
    private pathContainer: Selection<SVGElement>;
    private path: Selection<SVGElement>;
    private title: Selection<SVGElement>;
    private titleContainer: Selection<SVGElement>;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;

        this.svg = d3.select(this.target).append('svg');
        this.pathContainer = this.svg.append('svg');
        this.path = this.pathContainer.append('path');
        this.titleContainer = this.svg.append('svg');
        this.title = this.titleContainer.append('text');

        this.path
            .attr('d', 'm 0,0 L .75,0 L 1,.5 L .75,1 L 0,1 L .25,.5 Z')
            ;
    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        let rotation: number = this.settings.shape.rotation;

        let width: number = this.target.offsetWidth;
        let height: number = this.target.offsetHeight;

        // set the indent to half the length of the shortest side
        let indent: number = Math.min(width, height) / 2 / Math.max(width, height);

        this.svg
            .attr('width', width)
            .attr('height', height)
            ;
        this.pathContainer
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 1 1')
            .attr('preserveAspectRatio', 'none')
            ;
        this.path
            .attr('d', `m 0,0 L ${1 - indent},0 L 1,.5 L ${1 - indent},1 L 0,1 L ${indent},.5 Z`)
            .attr('transform', `rotate(${rotation} .5 .5)`)
            .attr('fill', this.settings.shape.fill)
            .attr('stroke', this.settings.shape.stroke)
            .attr('stroke-width', 1 / width)
            ;
        this.titleContainer
            .attr('width', '100%')
            .attr('height', '100%')
            ;
        this.title
            .attr('x', '50%')
            .attr('y', '50%')
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .style('font-size', `${this.settings.shape.fontSize}pt`)
            .style('fill', this.settings.shape.fontColor)
            .text(this.settings.shape.title)
            ;
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}